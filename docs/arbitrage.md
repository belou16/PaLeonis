# Note d'arbitrage : PostgreSQL ou MongoDB

## 1. Tableau de décision

| Donnée | PostgreSQL ou MongoDB | Critère décisif | Forme retenue |
| --- | --- | --- | --- |
| Fiche technique d'une offre | MongoDB | Structure **variable** selon la catégorie, qui doit pouvoir évoluer sans migration. Aucune transaction, peu d'écritures, lue avec l'offre. | Collection `fiches_techniques`, un document par offre (`offreId` unique), **discriminators** Mongoose sur `categorie`, plus un champ libre `caracteristiques` |
| Événement serveur | MongoDB | **Volume d'écriture** élevé (des milliers par jour), données **jamais modifiées**, structure variable selon le type, lecture du plus récent au plus ancien. Pas de lien fort à garantir au-delà du serveur. | Collection `evenements`, un document par événement, **discriminators** sur `type`, index `{ serveurId: 1, date: -1 }` |
| Message de ticket | MongoDB | Structure souple (pièces jointes en tableau de taille variable), fil qui **grossit sans limite**, lu en entier à l'ouverture du ticket. Pas de transaction multi-table. | Collection `messages`, **référencée** : un document par message avec `ticketId`, index `{ ticketId: 1, createdAt: 1 }` |
| Offre, serveur, ticket, client… (existant) | PostgreSQL (inchangé) | **Liens forts** et intégrité (clés étrangères), **transaction** de souscription. | Tables du TP 3 |

Pourquoi des discriminators plutôt que `Schema.Types.Mixed` ? `Mixed` n'impose rien : une fiche de VPS sans RAM passerait. Les discriminators donnent un schéma par catégorie (ou par type d'événement) dans **une seule collection** : on garde la validation et les requêtes restent simples (`find({ serveurId })` renvoie tous les types). Le champ `caracteristiques` (Mixed) laisse le commercial ajouter des informations sans toucher au code.

## 2. Modèles de documents

**N1 — fiche technique (VPS)**

```json
{
  "_id": "665f1c2a9b1e8a0012a4b001",
  "offreId": 1,
  "categorie": "VPS",
  "vcpu": 2,
  "ramGo": 4,
  "stockageGo": 80,
  "typeStockage": "NVMe",
  "systeme": "Ubuntu 24.04 LTS",
  "caracteristiques": { "ipv6": true, "snapshots": 2 },
  "createdAt": "2026-10-20T09:12:00.000Z",
  "updatedAt": "2026-10-20T09:12:00.000Z"
}
```

Nom de domaine : `{ "offreId": 5, "categorie": "NOM_DE_DOMAINE", "extension": ".fr", "registrar": "AFNIC", "dureeEngagementMois": 12 }`.
Serveur dédié : `{ "offreId": 4, "categorie": "SERVEUR_DEDIE", "processeur": "AMD EPYC 4344P", "disques": [{ "type": "NVMe", "capaciteGo": 960 }], "bandePassanteMbps": 1000 }`.

**N2 — événement serveur (alerte, puis relevé de métriques)**

```json
{
  "_id": "665f1c2a9b1e8a0012a4c010",
  "serveurId": 1,
  "type": "ALERTE",
  "date": "2026-10-27T22:41:05.000Z",
  "niveau": "CRITIQUE",
  "message": "Disque /var rempli à 95 %",
  "createdAt": "2026-10-27T22:41:05.120Z"
}
```

```json
{ "serveurId": 1, "type": "METRIQUE", "date": "2026-10-27T22:45:00.000Z", "cpu": 87.5, "ram": 71.2, "disque": 95.0 }
```

**N3 — message de ticket (référencé)**

```json
{
  "_id": "665f1c2a9b1e8a0012a4d100",
  "ticketId": 1,
  "auteur": { "type": "TECHNICIEN", "id": 1 },
  "contenu": "J'ai redémarré le service SSH, pouvez-vous réessayer ?",
  "piecesJointes": [
    { "nom": "journal-sshd.txt", "url": "https://files.paleonis.fr/t1/journal-sshd.txt" }
  ],
  "createdAt": "2026-10-28T08:15:00.000Z"
}
```

**Imbriqué ou référencé ? Référencé.** Un fil n'a pas de taille maximale : imbriqué, chaque message ajouterait au même document, qui grossit sans fin (limite de 16 Mo, réécriture d'un document de plus en plus gros, conflits si deux personnes écrivent en même temps). Référencé, ajouter un message est un simple `insertOne`. La lecture du fil complet reste **une seule requête** (`find({ ticketId }).sort({ createdAt: 1 })`), couverte par l'index. On garde aussi la possibilité de paginer un fil très long. Le ticket lui-même reste dans PostgreSQL : il n'y a donc pas de « document ticket » dans lequel imbriquer.

## 3. Entre les deux bases

**Qui vérifie l'existence ?** L'API, dans le contrôleur, avant toute écriture Mongo : elle lit l'offre, le serveur ou le ticket dans PostgreSQL et répond **404** s'il n'existe pas. Pour un message, elle vérifie aussi que l'auteur est le client du ticket ou un technicien existant (sinon 403/404), et que le ticket n'est pas `FERME` (sinon 409). C'est le rôle qu'avait la clé étrangère.

**Que deviennent les documents à la suppression ?** **Suppression en cascade applicative** : l'API supprime d'abord la ligne PostgreSQL (qui peut être refusée, par exemple une offre encore souscrite → 409), puis supprime les documents liés (`deleteOne` / `deleteMany` sur l'id). Offre → sa fiche ; serveur → ses événements ; ticket → ses messages. Un document orphelin n'a aucun sens sans son parent. Limite connue : il n'y a pas de transaction entre les deux bases. Si Mongo tombe entre les deux, des orphelins peuvent rester ; ils sont inoffensifs (jamais lus sans le parent) et peuvent être nettoyés par un script.

## 4. Au-delà du document

**Besoin A — clé-valeur (Redis).** *« Quand un client consulte l'état de son serveur dans l'espace client, on veut une réponse instantanée, et on veut bloquer un client qui ouvre plus de 5 tickets en une minute. »* PostgreSQL ou Mongo feraient une requête disque pour une donnée qui change toutes les secondes et ne vaut que quelques minutes. Redis garde tout en mémoire, avec une expiration par clé (`EXPIRE`) et un compteur atomique (`INCR`).
Donnée : `serveur:1:etat → "EN_SERVICE|cpu=42|ram=61"` (TTL 30 s) ; `ratelimit:tickets:client:2 → 3` (TTL 60 s).

**Besoin B — graphe (Neo4j).** *« Avant une maintenance sur un datacenter ou un serveur, on veut savoir en un clic quels clients, abonnements et services seront touchés, y compris par rebond (un DNS hébergé sur un serveur qui sert des domaines d'autres clients). »* En SQL, cela demande des jointures récursives de profondeur inconnue ; en Mongo, des `$graphLookup` peu lisibles. Une base graphe parcourt les relations directement.
Donnée : nœuds `(:Datacenter {nom:"DC-PAR-01"})`, `(:Serveur {id:1})`, `(:Client {id:1})`, `(:Domaine {nom:"acme.fr"})` ; relations `(Serveur)-[:HEBERGE_DANS]->(Datacenter)`, `(Client)-[:UTILISE]->(Serveur)`, `(Domaine)-[:RESOLU_PAR]->(Serveur)`. Requête : `MATCH (d:Datacenter {nom:"DC-PAR-01"})<-[*1..4]-(c:Client) RETURN DISTINCT c`.

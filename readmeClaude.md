# PaLeonis API — Tester les routes Abonnement & Catalogue sur Insomnia

## 1. Le projet en bref

API REST **Express 5** (Node.js, CommonJS) + **PostgreSQL 16**, organisée en **MVC** :

```
src/
├── server.js          # point d'entrée : montage des routes, 404, gestion d'erreurs JSON
├── db.js              # pool PostgreSQL (pg) via DATABASE_URL
├── routes/            # déclaration des URL
├── controllers/       # req/res + codes HTTP
└── models/            # classes métier + requêtes SQL
database/
├── schema.sql         # schéma (client, offre, abonnement, serveur, datacenter, technicien, ticket)
└── seed.sql           # jeu d'essai, chargé automatiquement au 1er démarrage du conteneur
docs/conception.md     # spécification des endpoints
```

Toutes les routes lisent et écrivent dans PostgreSQL : **les données persistent** entre deux redémarrages du serveur.

Toutes les erreurs sont renvoyées au format JSON `{ "error": "message" }` :

| Code | Cas |
|------|-----|
| 400 | body invalide, JSON mal formé, id non numérique (`/offres/abc`), filtre invalide |
| 404 | ressource introuvable |
| 409 | conflit métier (offre retirée, aucun serveur libre, déjà résilié) |
| 500 | erreur inattendue (détail dans la console du serveur) |

## 2. Lancer le projet

```bash
cp .env.example .env          # si pas encore fait — vérifier POSTGRES_PORT / DATABASE_URL
docker compose up -d          # PostgreSQL + Adminer (http://localhost:8080)
npm install
npm run dev                   # ou : npm start
```

→ `Serveur PaLeonis démarré sur http://localhost:3000`

> **Remettre la base à zéro** (revenir au jeu d'essai) :
> `docker compose down -v && docker compose up -d`
> (le volume est supprimé, `schema.sql` et `seed.sql` sont rejoués).

## 3. Configuration Insomnia

1. Créer une collection **PaLeonis**.
2. Dans *Base Environment* :
   ```json
   { "base_url": "http://localhost:3000/api" }
   ```
3. Requêtes `POST` / `PUT` : Body → **JSON**.

> Astuce : chaque commande `curl` de la section 7 peut être collée dans la barre d'URL d'Insomnia, qui la convertit en requête.

## 4. Jeu d'essai (seed.sql)

**Offres**

| id | nom             | categorie             | prix_mensuel_ht | en_vente |
|----|-----------------|-----------------------|-----------------|----------|
| 1  | VPS Start       | VPS                   | 5.99            | true     |
| 2  | VPS Pro         | VPS                   | 19.99           | true     |
| 3  | Mutualisé Perso | HEBERGEMENT_MUTUALISE | 2.49            | true     |
| 4  | Dédié Advance   | SERVEUR_DEDIE         | 79.00           | true     |
| 5  | Domaine .fr     | NOM_DE_DOMAINE        | 0.65            | **false** |

**Datacenters / serveurs**

| serveur | datacenter      | statut      | attribué à       |
|---------|-----------------|-------------|------------------|
| 1       | 1 (DC-PAR-01)   | EN_SERVICE  | abonnement 1     |
| 2       | 1 (DC-PAR-01)   | MAINTENANCE | —                |
| 3       | 2 (DC-LYO-01)   | EN_SERVICE  | abonnement 2     |

**Clients** : 1 (Martin, particulier), 2 (ACME SAS, entreprise)

**Abonnements**

| id | client_id | offre_id | serveur_id | statut | prix_applique |
|----|-----------|----------|------------|--------|---------------|
| 1  | 1         | 1        | 1          | ACTIF  | 5.99          |
| 2  | 2         | 4        | 3          | ACTIF  | 69.00         |

⚠️ Au départ **aucun serveur n'est libre** (le 2 est en maintenance) : une souscription renvoie `409` tant qu'on n'a pas résilié un abonnement.

## 5. Catalogue (offres)

Catégories valides : `VPS`, `HEBERGEMENT_MUTUALISE`, `SERVEUR_DEDIE`, `NOM_DE_DOMAINE`.

### GET `{{ base_url }}/offres` — lister / filtrer
Filtres optionnels en query string :
- `{{ base_url }}/offres?categorie=VPS`
- `{{ base_url }}/offres?en_vente=true`
- `{{ base_url }}/offres?categorie=VPS&en_vente=true`

→ `200` tableau d'offres. `?categorie=XX` ou `?en_vente=oui` → `400`.

### GET `{{ base_url }}/offres/1` — consulter
→ `200`
```json
{ "id": 1, "nom": "VPS Start", "categorie": "VPS", "prix_mensuel_ht": 5.99, "en_vente": true }
```
`/offres/99` → `404 { "error": "Offre introuvable." }` · `/offres/abc` → `400`

### POST `{{ base_url }}/offres` — créer
```json
{ "nom": "VPS Max", "categorie": "VPS", "prix_mensuel_ht": 39.90 }
```
`en_vente` est optionnel (défaut `true`). → `201` offre créée.

Cas d'erreur (`400`) :

| Body | Erreur |
|------|--------|
| `{ "categorie": "VPS", "prix_mensuel_ht": 5 }` | Le nom est obligatoire et doit être une chaîne non vide. |
| `{ "nom": "X", "categorie": "CLOUD", "prix_mensuel_ht": 5 }` | La catégorie doit être l'une de : … |
| `{ "nom": "X", "categorie": "VPS", "prix_mensuel_ht": "5" }` | Le prix_mensuel_ht est obligatoire et doit être un nombre. |
| `{ "nom": "X", "categorie": "VPS", "prix_mensuel_ht": -1 }` | Le prix ne peut pas être négatif. |
| `{ "nom": "X", "categorie": "VPS", "prix_mensuel_ht": 5, "en_vente": "oui" }` | en_vente doit être un booléen. |
| `{bad` | JSON invalide. |

### PUT `{{ base_url }}/offres/2` — modifier (mise à jour partielle)
```json
{ "prix_mensuel_ht": 24.99 }
```
→ `200` offre mise à jour. Seuls les champs envoyés sont modifiés, avec les mêmes règles de validation (`400`). Id inexistant → `404`.

### PATCH `{{ base_url }}/offres/2/retrait` — retirer de la vente
Pas de body. → `200` offre avec `"en_vente": false`. Id inexistant → `404`.
L'offre n'est pas supprimée (des abonnements peuvent y faire référence), elle ne peut simplement plus être souscrite.

## 6. Abonnements

### GET `{{ base_url }}/abonnements` — lister
→ `200` tableau d'abonnements.

### GET `{{ base_url }}/abonnements/1` — consulter
→ `200`
```json
{ "id": 1, "client_id": 1, "offre_id": 1, "serveur_id": 1, "date_debut": "2026-08-29", "date_fin": null, "statut": "ACTIF", "prix_applique": 5.99 }
```
`/abonnements/99` → `404 { "error": "Abonnement introuvable." }`

### POST `{{ base_url }}/abonnements` — souscrire
```json
{ "client_id": 2, "offre_id": 2, "datacenter_id": 1 }
```
Dans **une transaction**, l'API vérifie le client, l'offre et le datacenter, prend le premier serveur `EN_SERVICE` **libre** de ce datacenter et crée l'abonnement (`statut: ACTIF`, `date_debut` = aujourd'hui, `prix_applique` = prix actuel de l'offre). En cas d'échec, rien n'est enregistré.
→ `201` abonnement créé avec son `serveur_id`.

Cas d'erreur :

| Body | Code | Erreur |
|------|------|--------|
| `{ "offre_id": 2, "datacenter_id": 1 }` | 400 | client_id est obligatoire et doit être un entier positif. |
| `{ "client_id": "2", "offre_id": 2, "datacenter_id": 1 }` | 400 | client_id est obligatoire… |
| `{ "client_id": 2, "datacenter_id": 1 }` | 400 | offre_id est obligatoire… |
| `{ "client_id": 2, "offre_id": 2 }` | 400 | datacenter_id est obligatoire… |
| `{ "client_id": 99, "offre_id": 2, "datacenter_id": 1 }` | 404 | Client introuvable. |
| `{ "client_id": 2, "offre_id": 99, "datacenter_id": 1 }` | 404 | Offre introuvable. |
| `{ "client_id": 2, "offre_id": 2, "datacenter_id": 99 }` | 404 | Datacenter introuvable. |
| `{ "client_id": 2, "offre_id": 5, "datacenter_id": 1 }` | 409 | Cette offre a été retirée de la vente. |
| `{ "client_id": 2, "offre_id": 2, "datacenter_id": 1 }` (avec le seed) | 409 | Aucun serveur libre dans ce datacenter. |

### PATCH `{{ base_url }}/abonnements/1/resiliation` — résilier
Pas de body. → `200` avec `statut: "RESILIE"`, `date_fin` = aujourd'hui, `serveur_id: null` (le serveur redevient libre).
- Second appel → `409 { "error": "Abonnement déjà résilié." }`
- `/abonnements/99/resiliation` → `404`

## 7. Scénario de test enchaîné (depuis le seed)

1. `POST /abonnements` `{ "client_id": 2, "offre_id": 2, "datacenter_id": 1 }` → **409** aucun serveur libre
2. `PATCH /abonnements/1/resiliation` → **200**, serveur 1 libéré
3. `GET /serveurs?attribue=false` → le serveur 1 apparaît comme libre
4. Rejouer l'étape 1 → **201**, `serveur_id: 1`, `prix_applique: 19.99`
5. `PATCH /offres/2/retrait` → **200**, `en_vente: false`
6. `POST /abonnements` `{ "client_id": 1, "offre_id": 2, "datacenter_id": 2 }` → **409** offre retirée
7. `GET /dashboard/revenus` → le CA reflète les abonnements actifs

Pour recommencer : `docker compose down -v && docker compose up -d`.

## 8. Commandes curl (importables dans Insomnia)

```bash
# Catalogue
curl http://localhost:3000/api/offres
curl "http://localhost:3000/api/offres?categorie=VPS&en_vente=true"
curl http://localhost:3000/api/offres/1
curl -X POST http://localhost:3000/api/offres -H 'Content-Type: application/json' -d '{"nom":"VPS Max","categorie":"VPS","prix_mensuel_ht":39.9}'
curl -X PUT http://localhost:3000/api/offres/2 -H 'Content-Type: application/json' -d '{"prix_mensuel_ht":24.99}'
curl -X PATCH http://localhost:3000/api/offres/2/retrait

# Abonnements
curl http://localhost:3000/api/abonnements
curl http://localhost:3000/api/abonnements/1
curl -X POST http://localhost:3000/api/abonnements -H 'Content-Type: application/json' -d '{"client_id":2,"offre_id":2,"datacenter_id":1}'
curl -X PATCH http://localhost:3000/api/abonnements/1/resiliation
```

## 9. Autres routes disponibles

| Méthode | Route | Rôle |
|---------|-------|------|
| GET  | `/api/clients`, `/api/clients/:id` | lister / consulter les clients |
| POST | `/api/clients` | créer (`type`, `email`, `nom` ou `siret` + `raison_sociale`) |
| GET  | `/api/serveurs?datacenter=&statut=&attribue=` | lister les serveurs |
| GET  | `/api/serveurs/:id` | consulter un serveur |
| POST | `/api/tickets` | ouvrir (`clientId`, `sujet`, `description`, `serveurId?`, `priorite?`) |
| GET  | `/api/tickets/:id` | consulter |
| PATCH | `/api/tickets/:id/assignation` | `{ "technicienId": 1 }` |
| PATCH | `/api/tickets/:id/status` | `{ "statut": "EN_COURS" }` |
| GET  | `/api/techniciens`, `/api/techniciens/:id` | lister / consulter |
| GET  | `/api/techniciens/:id/tickets` | tickets non fermés du technicien |
| GET  | `/api/dashboard/revenus`, `/api/dashboard/serveurs` | tableau de bord |

Prévu dans `docs/conception.md` mais **pas encore implémenté** : `PUT`/`DELETE /clients/:id`, recherche de clients, `GET /clients/:id/fiche`, `GET /datacenters` et `/datacenters/:id`.

Clients
POST /clients créer 201, 400, 409
GET /clients lister, rechercher par nom ou email 200
GET /clients/{id} consulter 200, 404
PUT /clients/{id} modifier 200, 400, 404
DELETE /clients/{id} supprimer 204, 404, 409

Catalogue
GET /offres lister catégorie, filtrer par catégorie et en Vente 200
GET /offres/{id} consulter 200, 404
POST /offres créer 201, 400
PUT /offres/{id} modifier 200, 400, 404
PATCH /offres/{id}/retrait retirer de la vente 200, 404

Abonnements
POST /abonnements souscrire et attribuer un serveur 201, 400, 404, 409
GET /abonnements lister 200
GET /abonnements/{id} consulter 200, 404
PATCH /abonnements/{id}/résiliation résilier et libérer le serveur 200, 404, 409

# Fiche client

GET /clients/{id}/fiche client, abonnements, offres, serveurs 200, 404

Serveurs
GET /serveurs lister, filtres datacenter / statut / attribué 200
GET /serveurs/{id} consulter 200, 404

Tickets
POST /tickets ouvrir 201, 400, 404
GET /tickets/{id} consulter 200, 404
PATCH /tickets/{id}/assignation assigner à un technicien 200, 400, 404
PATCH /tickets/{id}/status faire évoluer le statut 200, 400, 404
GET /techniciens/{id}/tickets tickets non fermés, triés par priorité 200, 404

Tableau de bord
GET /dashboard/revenus CA mensuel, total et par catégorie 200
GET /dashboard/serveurs serveurs par datacenter et statut 200

Referentiels
GET /datacenters lister 200
GET /datacenters/{id} consulter 200, 404
GET /techniciens lister 200
GET /techniciens/{id} consulter 200, 404

# Répartition des tâches : API d'hébergement

## Vue d'ensemble

|                 | **Max**                             | **Titouan**                        | **Armando**                                |
| --------------- | ----------------------------------- | ---------------------------------- | ------------------------------------------ |
| Besoins         | B1, B5, B10                         | B2, B3, B4                         | B6, B7, B8, B9                             |
| Domaines        | Clients, Fiche client, Référentiels | Catalogue, Abonnements             | Serveurs, Tickets, Dashboard               |
| Endpoints       | 10                                  | 9                                  | 9                                          |
| Point difficile | Fiche client (jointures)            | Transaction souscription + serveur | Agrégations du dashboard, tri par priorité |

---

## Max : Clients et référentiels

### Clients (B1)

| Méthode | Route           | Rôle                                | Codes         |
| ------- | --------------- | ----------------------------------- | ------------- |
| POST    | `/clients`      | Créer                               | 201, 400, 409 |
| GET     | `/clients`      | Lister, rechercher par nom ou email | 200           |
| GET     | `/clients/{id}` | Consulter                           | 200, 404      |
| PUT     | `/clients/{id}` | Modifier                            | 200, 400, 404 |
| DELETE  | `/clients/{id}` | Supprimer                           | 204, 404, 409 |

- 409 sur POST : email déjà existant
- 409 sur DELETE : client ayant des abonnements

### Fiche client (B5)

| Méthode | Route                 | Rôle                                                 | Codes    |
| ------- | --------------------- | ---------------------------------------------------- | -------- |
| GET     | `/clients/{id}/fiche` | Client, abonnements, nom de l'offre, serveur associé | 200, 404 |

### Référentiels (B10), lecture seule

| Méthode | Route               | Codes    |
| ------- | ------------------- | -------- |
| GET     | `/datacenters`      | 200      |
| GET     | `/datacenters/{id}` | 200, 404 |
| GET     | `/techniciens`      | 200      |
| GET     | `/techniciens/{id}` | 200, 404 |

### Jeu d'essai

- Datacenters, techniciens, clients

---

## Titouan : Catalogue et abonnements

### Catalogue (B2)

| Méthode | Route                  | Rôle                                          | Codes         |
| ------- | ---------------------- | --------------------------------------------- | ------------- |
| GET     | `/offres`              | Lister, filtrer par catégorie et « en vente » | 200           |
| GET     | `/offres/{id}`         | Consulter                                     | 200, 404      |
| POST    | `/offres`              | Créer                                         | 201, 400      |
| PUT     | `/offres/{id}`         | Modifier                                      | 200, 400, 404 |
| PATCH   | `/offres/{id}/retrait` | Retirer de la vente                           | 200, 404      |

### Abonnements (B3, B4)

| Méthode | Route                           | Rôle                              | Codes              |
| ------- | ------------------------------- | --------------------------------- | ------------------ |
| POST    | `/abonnements`                  | Souscrire et attribuer un serveur | 201, 400, 404, 409 |
| GET     | `/abonnements`                  | Lister                            | 200                |
| GET     | `/abonnements/{id}`             | Consulter                         | 200, 404           |
| PATCH   | `/abonnements/{id}/resiliation` | Résilier et libérer le serveur    | 200, 404, 409      |

- **Souscription (B3)** : transaction qui crée l'abonnement et attribue un serveur libre du datacenter demandé. En cas d'échec, rollback complet : rien n'est enregistré.
  - 404 : client, offre ou datacenter inexistant
  - 409 : aucun serveur libre, ou offre retirée de la vente
- **Résiliation (B4)** : mise à jour du statut et de la date de fin, le serveur redevient libre.
  - 409 : abonnement déjà résilié

### Jeu d'essai

- Offres et quelques abonnements

---

## Armando : Serveurs, tickets et dashboard

### Serveurs (B6)

| Méthode | Route            | Rôle                                                    | Codes    |
| ------- | ---------------- | ------------------------------------------------------- | -------- |
| GET     | `/serveurs`      | Lister, filtres datacenter / statut / libre ou attribué | 200      |
| GET     | `/serveurs/{id}` | Consulter                                               | 200, 404 |

### Tickets (B7, B8)

| Méthode | Route                       | Rôle                                                   | Codes         |
| ------- | --------------------------- | ------------------------------------------------------ | ------------- |
| POST    | `/tickets`                  | Ouvrir                                                 | 201, 400, 404 |
| GET     | `/tickets/{id}`             | Consulter                                              | 200, 404      |
| PATCH   | `/tickets/{id}/assignation` | Assigner à un technicien                               | 200, 400, 404 |
| PATCH   | `/tickets/{id}/status`      | Faire évoluer le statut                                | 200, 400, 404 |
| GET     | `/techniciens/{id}/tickets` | Tickets non fermés, du plus critique au moins critique | 200, 404      |

- 400 sur `/status` : transition de statut invalide

### Tableau de bord (B9)

| Méthode | Route                 | Rôle                                                      | Codes |
| ------- | --------------------- | --------------------------------------------------------- | ----- |
| GET     | `/dashboard/revenus`  | CA mensuel des abonnements actifs, total et par catégorie | 200   |
| GET     | `/dashboard/serveurs` | Nombre de serveurs par datacenter et par statut           | 200   |

### Jeu d'essai

- Serveurs et tickets

---

## Tâches communes (à faire ensemble au démarrage)

1. **Schéma de la base de données** : tables, clés étrangères, valeurs de statut (abonnement, serveur, ticket, priorité).
2. **Structure du projet** : arborescence, conventions de nommage, format JSON commun pour les erreurs 400, 404 et 409.
3. **Documentation** (Swagger/OpenAPI ou README) : chacun documente ses propres endpoints.
4. **Tests** : chacun teste ses routes, puis relecture croisée :
   - Max relit Titouan
   - Titouan relit Armando
   - Armando relit Max

## Dépendances à surveiller

- **Titouan** a besoin de la table `serveurs` d'Armando pour la souscription : elle doit être créée dès le départ dans le schéma commun.
- **Max** (fiche client) et **Armando** (dashboard revenus) dépendent des abonnements de Titouan. Ils peuvent avancer avec des données insérées à la main dans le jeu d'essai, sans attendre la fin de ses endpoints.

## Ordre conseillé

1. Schéma commun et jeu d'essai
2. CRUD simples (clients, offres, référentiels, serveurs)
3. Logique métier (souscription transactionnelle, résiliation, tickets)
4. Fiche client et dashboard
5. Tests d'intégration et documentation

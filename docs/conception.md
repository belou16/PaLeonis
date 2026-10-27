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

Répartition
Max = Clients et catalogue
B1, B2, B5. 11 endpoints.

Armando = Abonnements et serveurs
B3, B4, B6 + GET /datacenters. 8 endpoints.

Titouan = Support et pilotage
B7, B8, B9 + GET /techniciens. 9 endpoints.

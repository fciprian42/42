## Utiliser l'application en local

### Installations

Pour pouvoir lancer <strong>Hypertube</strong> il vous faudra vous procécurez :

   - [NodeJS](https://nodejs.org/en/) >= 10.1.0
   - [MongoDB](https://www.mongodb.com/download-center#community) >= 3.6.4 (base de données NoSQL)
   - [Robo 3T](https://robomongo.org/download) (GUI pour mongodb)
   - Pour les utilisaeurs osx, Xcode est disponible dans l'app store et pour le <strong>command line developer tools</strong> exécutez dans le terminal  `xcode-select --install`
   
Une fois les installations effectuées, il ne reste plus qu'a configurer l'ensemble de l'application !

Téléchargez maintenat le projet sur votre bureau `git clone https://github.com/fciprian42/42.git`

### Configuration MongoDB

Dans un premier temps il faut configurer la base de données, avec le lien
ci-dessus vous devriez avoir téléchargé un fichier comprenant l'ensemble de mongoDB (mettez le au préalable sur votre bureau).

Tout d'abord il faut créer un fichier <strong>data/db</strong> à la racine de votre session, c'est là où sera stocker les différentes base de données

`cd ~ > mkdir data && cd data && mkdir db`

Démarrons la base de donnée, rendez vous dans votre dossier mongodb téléchargé puis exécuter le commande suivante

`cd bin && ./mongod --dbpath ~/data/db`

Il ne manque plus qu'a importer les fichiers `series.json` et movies.json` qui se trouvent dans <strong>api/db</strong>, Ouvrez
un autre terminal, puis rendez vous dansvotre  dossier mongodb téléchargé puis exécuter la commande suivante

`./mongoimport --db hypertube --collection movies --file PATH_MOVIES.JSON`
`./mongoimport --db hypertube --collection series --file PATH_SERIES.JSON`

`./mongo > use hypertube`

Il ne reste plus qu'a se connecter à la base de donnée depuis une GUI (Robo 3T)

   - Créer une nouvelle connection, cliquez sur <strong>Create</strong> ![alt text](https://image.noelshack.com/fichiers/2018/19/7/1526240643-capture-d-ecran-2018-05-13-a-21-14-41.png)
   - Configurez la nouvelle connection, puis cliquez sur <strong>Save</strong> ![alt text](https://image.noelshack.com/fichiers/2018/19/7/1526240648-capture-d-ecran-2018-05-13-a-21-14-58.png)
   - Connectez-vous ! cliquez sur <strong>Connect</strong> ![alt text](https://image.noelshack.com/fichiers/2018/19/7/1526240652-capture-d-ecran-2018-05-13-a-21-15-15.png)
   
### Démarrer l'application

Lancez une nouveau terminal, puis rendez vous dans le dossier <strong>hypertube</strong>

    Lancement du serveur
    
    cd api > npm i
    npm run start
    
    Lancement de l'application
    
    cd app > npm i
    npm start
    
 
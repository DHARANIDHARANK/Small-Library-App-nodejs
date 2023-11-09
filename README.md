# Small-Library-App-nodejs

Created with two API that secured by JWT and protected by the roles,
1. user with role "CREATOR" can able to create books, and the API is "/books"
2. "VIEWER" can view books and the API is "/books"
3. "VIEW_ALL" can see all created books API is "/books"
4. each user is having Multiple roles
5. Able to view Books created 10min Ago and more in API "/books?old=1"
6. Able to view that were created less than 10min age "/books?new=1"
7. USED MangoDB for this project

8. First install Node js in your machine => https://nodejs.org/en/

After installation check the version of CLI via:
```bash
node --version
```

Clone this repository and open that in VS code.

Open terminal in current folder.

Execute below commands:
```bash
npm init
npm install express
npm install jsonwebtoken
npm install dotenv
npm install mongodb
npm install nodemon
```

Execute the server file:
```bash
node server.js
```
(or)
```bash
nodemon server.js
```

After all these steps server should be starting on localhost port 5000. 

Open POSTMAN application, and try to exceute endpoints mentioned in script

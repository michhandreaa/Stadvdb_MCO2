# MCO2: Transaction Management

# Models
models/db.js = Handles query concurrency

models/nodes.js = Connect to nodes and execute queries

models/transaction.js = Start transactions

models/logs.js = Connect to logs table

models/sync.js = Updates nodes

models/replicator.js = Handles data replication

# Setup
1. Navigate to the project folder (containing index.js)
2. Run the command in order to install all the modules needed:
```
npm install
```
3. Run the server by typing ```node index.js```
4. Run the web application with the link ```http://localhost:3000``` on your browser.

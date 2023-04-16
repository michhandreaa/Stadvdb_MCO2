# MCO2: Transaction Management

# Models
models/db.js = Handles query concurrency
models/nodes.js = Connect to nodes and execute queries
models/transaction.js = Start transactions
models/logs.js = Connect to logs table
models/sync.js = Updates nodes
models/replicator.js = Handles data replication

# Setup
1. Extract the folder from the zipped file that you can download through this DownGit [link]
3. Naviate to the project folder (using the cd command) 
(i.e. the main folder containing the file index.js)
4. Run the command in order to install all the modules needed in order to run the project successfully:
```
npm install 
```
5. We may now run the server by typing ```node index.js```
6. Since the web application is running on localhost:3000, type ```http://localhost:3000``` on your browser of choice.
7. Now, you would be able to see and use the application!

const cron = require('node-cron');
const sync = require('./sync.js');

let is_replicating_1 = false;
let is_replicating_2 = false;
let is_replicating_3 = false;

const replicator_funcs = {
    replicate: async function () {
        console.log('Scheduling replication!')
        cron.schedule('*/1 * * * * *', () => {
            console.log('Starting replication!')
            if (is_replicating_1) console.log('Node 1 currently replicating!');
            if (is_replicating_2) console.log('Node 2 currently replicating!');
            if (is_replicating_3) console.log('Node 3 currently replicating!');

            if (!is_replicating_1)
                try {
                    is_replicating_1 = true;
                    var result = sync.sync_leader_node();
                    if (result) is_replicating_1 = false;
                }
                catch (error) {
                    //console.log(error);
                    console.log('Failed to connect to node 1!');
                }

            if (!is_replicating_2)
                try {
                    is_replicating_2 = true;
                    var result = sync.sync_follower_node(2);
                    if (result) is_replicating_2 = false;
                }
                catch (error) {
                    //console.log(error);
                    console.log('Failed to connect to node 2!');
                }
                
            if (!is_replicating_3)
                try {
                    is_replicating_3 = true;
                    var result = sync.sync_follower_node(3);
                    if (result) is_replicating_3 = false;
                }
                catch (error) {
                    //console.log(error);
                    console.log('Failed to connect to node 3!');
                }
        });
    }
}
module.exports = replicator_funcs;
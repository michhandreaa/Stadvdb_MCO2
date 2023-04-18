const { NULL } = require('mysql/lib/protocol/constants/types');
const mysql = require('mysql2/promise');

const nodes = require('./nodes.js');
const transaction = require('./transaction.js');
const queryHelper = require('../helpers/queryHelper.js');
const { query_node, ping_node } = require('./nodes.js');

const sync_funcs = {
    sync_leader_node: async function () {
        let logs = [];
        let logs2 = [];
        let logs3 = [];
        try {
            if (await ping_node(2))  logs2 = await query_node(2, queryHelper.to_retrieve_logs(1));
            if (await ping_node(3))  logs3 = await query_node(3, queryHelper.to_retrieve_logs(1));
            if (logs2[0]) logs = logs2[0];
            if (logs3[0] && logs) logs = logs.concat(logs3[0]);
            else if (logs3[0]) logs = logs3[0];

            if (logs) {
                logs.sort((a, b) => a.date.getTime() - b.date.getTime());

                for (let i = 0; i < logs.length; i++) {
                    let query;
                    switch (logs[i].type) {
                        case 'INSERT':
                            if (await ping_node(logs[i].dest_node)) {
                                query = queryHelper.to_insert_query(logs[i].name, logs[i].rank, logs[i].year);
                                var update = queryHelper.to_finish_log(logs[i].replicated_id);
                                var result = await transaction.insert_update_transaction_with_log(logs[i].dest_node, query, update, logs[i].src_node, logs[i].id);
                                return (result instanceof Error) ? false : true;
                            }
                        case 'UPDATE':
                            query = queryHelper.to_update_query(logs[i].id, logs[i].name, logs[i].rank, logs[i].year);
                            var update = queryHelper.to_finish_log(logs[i].replicated_id);
                            var result = await transaction.make_2transaction(logs[i].dest_node, query, update, 'UPDATE', logs[i].id, logs[i].src_node);
                            return (result instanceof Error) ? false : true;

                        case 'DELETE':
                            query = queryHelper.to_delete_query(logs[i].id);
                            var update = queryHelper.to_finish_log(logs[i].replicated_id);
                            var result = await transaction.make_2transaction(logs[i].dest_node, query, update, 'DELETE', logs[i].id, logs[i].src_node);
                            return (result instanceof Error) ? false : true;
                    }
                    console.log('Synced to Node 1');
                }
            }

            return true;
        }
        catch (error) {
            console.log(error)
            return false;
        }
    },

    sync_follower_node: async function (node) {
        let logs = [];
        let logs2 = [];
        let logs3 = [];

        try {
            var other = (node === 2) ? 3 : 2;

            if (await ping_node(1))  logs2 = await query_node(1, queryHelper.to_retrieve_logs(node));
            if (await ping_node(other)) logs3 = await query_node(other, queryHelper.to_retrieve_logs(node));
            
            if (logs2[0]) logs = logs2[0];
            if (logs3[0] && logs) logs = logs.concat(logs3[0]);
            else if (logs3[0]) logs = logs3[0];
            
            if (logs) {
                for (let i = 0; i < logs.length; i++) {
                    if (await ping_node(logs[i].dest_node)) {
                        let query;
                        switch (logs[i].type) {
                            case 'INSERT':
                                if (logs[i].id) 
                                    query = queryHelper.to_insert_query_with_id(logs[i].id, logs[i].name, logs[i].rank, logs[i].year);
                                else 
                                    query = queryHelper.to_insert_query(logs[i].name, logs[i].rank, logs[i].year);
                                break;
                            case 'UPDATE':
                                
                                if (logs[i].new_id) {
                                    query = queryHelper.to_update_id_query(logs[i].new_id, logs[i].id);
                                }
                                else {
                                    query = queryHelper.to_update_query(logs[i].id, logs[i].name, logs[i].rank, logs[i].year);
                                }
                                break;
                                
                            case 'DELETE':
                                query = queryHelper.to_delete_query(logs[i].id); break;
                        }
                        var result = await transaction.insert_update_transaction(logs[i].dest_node, query, queryHelper.to_finish_log(logs[i].replicated_id), logs[i].src_node, logs[i].type, logs[i].id);
                        console.log('Synced to Node ' + node);
                        return (result instanceof Error) ? false : true;
                    }
                }
            }
            return true;
        }
        catch (error) {
            console.log(error)
        }
    }
}
module.exports = sync_funcs;
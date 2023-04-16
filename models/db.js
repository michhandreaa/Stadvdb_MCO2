const { NULL } = require('mysql/lib/protocol/constants/types');
const nodes = require('./nodes.js');
const queryHelper = require('../helpers/queryHelper.js');
const { ping_node, query_node } = require('./nodes.js');
const { make_transaction, make_transaction_with_log, make_transaction_with_log2, insert_transaction_with_log } = require('./transaction.js');

const db_functions = {
    execute_query_debug: async function (node, query) {
        if (await ping_node(node)) {
            try {
                var rows = await query_node(node, query);
                return rows[0];
            }
            catch (error) {
                return false;
            }
        }
    },

    execute_query: async function (query) {
        if (await ping_node(2) && await ping_node(3)) {
            var rows2 = await query_node(2, query);
            var rows3 = await query_node(3, query);
            return rows2[0].concat(rows3[0]);
        }
        else if (await ping_node(1)) {
            console.log(`One or more follower nodes are down.`);
            var rows = await query_node(1, query);
            return rows[0];
        }
        else {
            console.log(`All nodes are inaccessible.`);
        }
    },

    select_query: async function (query) {
        if (await ping_node(2) && await ping_node(3)) {
            var rows2 = await make_transaction(2, query, 'SELECT', '');
            var rows3 = await make_transaction(3, query, 'SELECT', '');
            return rows2[0].concat(rows3[0]);
        }
        else if (await ping_node(1)) {
            console.log(`One or more follower nodes are down.`);
            var rows = await make_transaction(1, query, 'SELECT', '');
            return rows[0];
        }
        else {
            console.log(`All nodes are inaccessible.`);
        }
    },

    insert_query: async function (name, rank, year) {
        // creates SQL statement for inserting row
        var query = queryHelper.to_insert_query(name, rank, year);
        var log;

        // if central node is up, insert row to central node and insert log based on year
        if (await ping_node(1)) {
            if (year < 1980)
                var result = insert_transaction_with_log(1, query, name, rank, year, 2);
            else
                var result = insert_transaction_with_log(1, query, name, rank, year, 3);
            return (result instanceof Error) ? false : true;
        }

        // if central node is down, insert row to follower node based on year and insert log to central
        else {
            if (year < 1980) {
                var result = insert_transaction_with_log(2, query, name, rank, year, 1);
                return (result instanceof Error) ? false : true;
            }
            else {
                var result = insert_transaction_with_log(3, query, name, rank, year, 1);
                return (result instanceof Error) ? false : true;
            }
        }
    },

    update_query: async function (id, name, rank, old_year, new_year) {
        // creates SQL statement for updating row
        var year = (old_year === new_year) ? '' : new_year;
        var query = queryHelper.to_update_query(id, name, rank, year);
        var log, log2;

        // if central node is up, insert row to central node and insert log based on year
        if (await ping_node(1)) {
            // from 2, to 3
            if (new_year >= 1980 && old_year < 1980) {
                log = queryHelper.to_delete_query_log(id, 2, 1);
                log2 = queryHelper.to_insert_query_log_with_id(id, name, new_year, rank, 3, 1);
                var result = await make_transaction_with_log2(1, query, log, log2, 'UPDATE', id);
                return (result instanceof Error) ? false : true;
            }
            // from 3, to 2
            else if (new_year < 1980 && old_year >= 1980) {
                log = queryHelper.to_delete_query_log(id, 3, 1);
                log2 = queryHelper.to_insert_query_log_with_id(id, name, new_year, rank, 2, 1);
                var result = await make_transaction_with_log2(1, query, log, log2, 'UPDATE', id);
                return (result instanceof Error) ? false : true;
            }
            // no change in year
            else {
                if (new_year < 1980)
                    log = queryHelper.to_update_query_log(id, name, year, rank, 2, 1);
                else
                    log = queryHelper.to_update_query_log(id, name, year, rank, 3, 1);

                var result = await make_transaction_with_log(1, query, log, 'UPDATE', id);
                return (result instanceof Error) ? false : true;
            }
        }

        // if central node is down, update row in follower node based on year and insert log to central
        else {
            // from 2, to 3
            if (new_year >= 1980 && old_year < 1980) {
                query = queryHelper.to_delete_query(id);
                log = queryHelper.to_update_query_log(id, name, new_year, rank, 1, 2);
                log2 = queryHelper.to_insert_query_log_with_id(id, name, new_year, rank, 3, 2);
                var result = await make_transaction_with_log2(2, query, log, log2, 'UPDATE', id);
                return (result instanceof Error) ? false : true;
            }
            // from 3, to 2
            else if (new_year < 1980 && old_year >= 1980) {
                query = queryHelper.to_delete_query(id);
                log = queryHelper.to_update_query_log(id, name, new_year, rank, 1, 3);
                log2 = queryHelper.to_insert_query_log_with_id(id, name, new_year, rank, 2, 3);
                var result = await make_transaction_with_log2(3, query, log, log2, 'UPDATE', id);
                return (result instanceof Error) ? false : true;
            }
            // no change in year
            else {
                if (new_year < 1980) {
                    log = queryHelper.to_update_query_log(id, name, year, rank, 1, 2);
                    console.log(query)
                    console.log(log)
                    console.log(id)
                    var result = await make_transaction_with_log(2, query, log, 'UPDATE', id);
                    return (result instanceof Error) ? false : true;
                }
                else {
                    log = queryHelper.to_update_query_log(id, name, year, rank, 1, 3);
                    var result = await make_transaction_with_log(3, query, log, 'UPDATE', id);
                    return (result instanceof Error) ? false : true;
                }
            }
        }
    },

    delete_query: async function (id, year) {
        // creates SQL statement for deleting row
        var query = queryHelper.to_delete_query(id);
        var log;

        // if central node is up, delete row from central node and insert log based on year
        if (await ping_node(1)) {
            if (year < 1980)
                log = queryHelper.to_delete_query_log(id, 2, 1);
            else
                log = queryHelper.to_delete_query_log(id, 3, 1);

            var result = make_transaction_with_log(1, query, log, 'DELETE', id);
            return (result instanceof Error) ? false : true;
        }
        else {
            // if central node is down, delete row from follower node based on year
            if (year < 1980) {
                log = queryHelper.to_delete_query_log(id, 1, 2);
                var result = make_transaction_with_log(2, query, log, 'DELETE', id);
                return (result instanceof Error) ? false : true;
            }
            else {
                log = queryHelper.to_delete_query_log(id, 1, 3);
                var result = make_transaction_with_log(3, query, log, 'DELETE', id);
                return (result instanceof Error) ? false : true;
            }
        }
    }
}

module.exports = db_functions;
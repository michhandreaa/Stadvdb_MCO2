const { NULL } = require('mysql/lib/protocol/constants/types');
const mysql = require('mysql2/promise');

const nodes = require('../models/nodes.js');
const queryHelper = require('../helpers/queryHelper.js');

const transactions_funcs = {
    insert_transaction_with_log: async function (node_to, query, name, rank, year, node_from) {
        try {
            let conn = await nodes.connect_node(node_to);
            if (conn)
                try {
                    await conn.beginTransaction();

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query + ' at Node ' + node_to);

                    var log = queryHelper.to_insert_query_log_with_id(result[0].insertId, name, year, rank, node_from, node_to);
                    var resultlog = await conn.query(log);
                    console.log('Created ' + log + ' at Node ' + node_to);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(node_to);
                    conn.release();
                    return error;
                }
            else {
                console.log('Unable to connect!');
            }
        }
        catch (error) {
            console.log(error);
            console.log('Unable to connect!');
            return error;
        }
    },

    insert_update_transaction_with_log: async function (node_to, query, update, node_from, old_id) {
        try {
            let conn = await nodes.connect_node(node_to);
            if (conn)
                try {
                    await conn.beginTransaction();

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query + ' at Node ' + node_to);

                    var log = queryHelper.to_update_query_id_log(result[0].insertId, old_id, node_from, node_to);
                    console.log(log)
                    var resultlog = await conn.query(log);
                    console.log('Created ' + log + ' at Node ' + node_to);

                    var resultupdate = await nodes.query_node(node_from, update);
                    console.log('Executed ' + update);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(node_to);
                    conn.release();
                    return error;
                }
            else {
                console.log('Unable to connect!');
            }
        }
        catch (error) {
            console.log(error);
            console.log('Unable to connect!');
            return error;
        }
    },

    insert_update_transaction: async function (node_to, query, update, node_from, type, id) {
        try {
            let conn = await nodes.connect_node(node_to);
            if (conn)
                try {
                    await conn.beginTransaction();

                    if (type === 'UPDATE' || type === 'DELETE')
                        await conn.query(queryHelper.to_select_for_update(id));

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query + ' at Node ' + node_to);

                    var resultupdate = await nodes.query_node(node_from, update);
                    console.log('Executed ' + update);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(node_to);
                    conn.release();
                    return error;
                }
            else {
                console.log('Unable to connect!');
            }
        }
        catch (error) {
            console.log(error);
            console.log('Unable to connect!');
            return error;
        }
    },

    make_2transaction: async function (node_to, query, update, type, id, node_from) {
        try {
            let conn = await nodes.connect_node(node_to);
            if (conn)
                try {
                    await conn.beginTransaction();

                    if (type === 'UPDATE' || type === 'DELETE')
                        await conn.query(queryHelper.to_select_for_update(id));

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query + ' at Node ' + node_to);
                    var resultupdate = await nodes.query_node(node_from, update);
                    console.log('Executed ' + update + ' at Node ' + node_from);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(node_to);
                    conn.release();
                    return error;
                }
            else {
                console.log('Unable to connect!');
            }
        }
        catch (error) {
            console.log(error);
            console.log('Unable to connect!');
            return error;
        }
    },

    make_transaction_with_log2: async function (node, query, log, log2, type, id) {
        try {
            let conn = await nodes.connect_node(node);
            if (conn)
                try {
                    await conn.beginTransaction();

                    if (type === 'UPDATE' || type === 'DELETE')
                        await conn.query(queryHelper.to_select_for_update(id));

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query  + ' at Node ' + node);

                    var resultlog = await conn.query(log);
                    console.log('Created ' + log);

                    var resultlog = await conn.query(log2);
                    console.log('Created ' + log2);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(node);
                    conn.release();
                    return error;
                }
            else {
                console.log('Unable to connect!');
            }
        }
        catch (error) {
            console.log(error);
            console.log('Unable to connect!');
            return error;
        }
    },

    make_transaction_with_log: async function (node, query, log, type, id) {
        console.log('yooo')
        try {
            let conn = await nodes.connect_node(node);
            if (conn)
                try {
                    await conn.beginTransaction();

                    if (type === 'UPDATE' || type === 'DELETE')
                        await conn.query(queryHelper.to_select_for_update(id));

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query);

                    var resultlog = await conn.query(log);
                    console.log('Created ' + log);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(node);
                    conn.release();
                    return error;
                }
            else {
                console.log('Unable to connect!');
            }
        }
        catch (error) {
            console.log(error);
            console.log('Unable to connect!');
            return error;
        }
    },

    make_transaction: async function (node, query, type, id) {
        try {
            let conn = await nodes.connect_node(node);
            if (conn)
                try {
                    await conn.beginTransaction();

                    if (type === 'UPDATE' || type === 'DELETE')
                        await conn.query(queryHelper.to_select_for_update(id));

                    await conn.query(`SET @@session.time_zone = "+08:00";`);

                    var result = await conn.query(query);
                    console.log('Executed ' + query);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(node);
                    conn.release();
                    return error;
                }
            else {
                console.log('Unable to connect!');
            }
        }
        catch (error) {
            console.log(error);
            console.log('Unable to connect!');
            return error;
        }
    }
}
module.exports = transactions_funcs;
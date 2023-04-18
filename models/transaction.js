const { NULL } = require('mysql/lib/protocol/constants/types');
const mysql = require('mysql2/promise');

const nodes = require('../models/nodes.js');
const queryHelper = require('../helpers/queryHelper.js');

const transactions_funcs = {
    insert_transaction_with_log: async function (dest_node, query, name, rank, year, src_node) {
        try {
            let conn = await nodes.connect_node(dest_node);
            if (conn)
                try {
                    await conn.beginTransaction();

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query + ' at Node ' + dest_node);

                    var log = queryHelper.to_insert_query_log_with_id(result[0].insertId, name, year, rank, src_node, dest_node);
                    var resultlog = await conn.query(log);
                    console.log('Created ' + log + ' at Node ' + dest_node);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(dest_node);
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

    insert_update_transaction_with_log: async function (dest_node, query, update, src_node, old_id) {
        try {
            let conn = await nodes.connect_node(dest_node);
            if (conn)
                try {
                    await conn.beginTransaction();

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query + ' at Node ' + dest_node);

                    var log = queryHelper.to_update_query_id_log(result[0].insertId, old_id, src_node, dest_node);
                    console.log(log)
                    var resultlog = await conn.query(log);
                    console.log('Created ' + log + ' at Node ' + dest_node);

                    var resultupdate = await nodes.query_node(src_node, update);
                    console.log('Executed ' + update);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(dest_node);
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

    insert_update_transaction: async function (dest_node, query, update, src_node, type, id) {
        try {
            let conn = await nodes.connect_node(dest_node);
            if (conn)
                try {
                    await conn.beginTransaction();

                    if (type === 'UPDATE' || type === 'DELETE')
                        await conn.query(queryHelper.to_select_for_update(id));

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query + ' at Node ' + dest_node);

                    var resultupdate = await nodes.query_node(src_node, update);
                    console.log('Executed ' + update);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(dest_node);
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

    make_2transaction: async function (dest_node, query, update, type, id, src_node) {
        try {
            let conn = await nodes.connect_node(dest_node);
            if (conn)
                try {
                    await conn.beginTransaction();

                    if (type === 'UPDATE' || type === 'DELETE')
                        await conn.query(queryHelper.to_select_for_update(id));

                    await conn.query(`SET @@session.time_zone = "+08:00";`);
                    var result = await conn.query(query);
                    console.log('Executed ' + query + ' at Node ' + dest_node);
                    var resultupdate = await nodes.query_node(src_node, update);
                    console.log('Executed ' + update + ' at Node ' + src_node);

                    await conn.commit();
                    await conn.release();
                    return result;
                }
                catch (error) {
                    console.log(error)
                    console.log('Rolled back the data.');
                    conn.rollback(dest_node);
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
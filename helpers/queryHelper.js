const { DateTime } = require("luxon");

const query_funcs = {
    to_insert_query: function (name, rank, year) {
        return `INSERT INTO movies (name, \`rank\`,  year) VALUES ('` + name + `', ` + rank + `, ` + year + `);`
    },

    to_insert_query_with_id: function (id, name, rank, year) {
        return `INSERT INTO movies (id, name, \`rank\`,  year) VALUES ('` + id + `', '` + name + `', ` + rank + `, ` + year + `);`
    },

    to_update_query: function (id, name, rank, year) {
        var query = `UPDATE movies SET`;

        if (name != '' && name != null) {
            query = query + ` name = '` + name + `'`;

            if (rank != '' && rank != null) {
                query = query + `, \`rank\` = ` + rank;

                if (year != '' && year != null) {
                    query = query + `, year = ` + year;
                }
            } else if (year != '' && year != null) {
                query = query + `, year = ` + year;
            }
        } else {
            if (rank != '' && rank != null) {
                query = query + ` \`rank\` = ` + rank;

                if (year != '' && year != null) {
                    query = query + `, year = ` + year;
                }
            } else if (year != '' && year != null) {
                query = query + ` year = ` + year;
            }
        }

        return query + ` WHERE id = ` + id + `;`;
    },

    to_update_id_query: function (new_id, old_id) {
        return 'UPDATE movies SET id = ' + new_id + ' WHERE id = ' + old_id;
    },

    to_delete_query: function (id) {
        return `DELETE FROM movies WHERE id = ` + id + `;`;
    },

    to_insert_query_log: function (name, year, rank, dest_node, src_node) {
        var query = `INSERT INTO log_table(type, dest_node, src_node, replicated, name`;

        if (year != '' && year != null) {
            query = query + ", year"
        }

        if (rank != '' && rank != null) {
            query = query + ', \`rank\`';
        }

        query = query + ") VALUES ('INSERT', " + dest_node + ', ' + src_node + `, false, '` + name + `'`;

        if (year != '' && year != null) {
            query = query + ", " + year;
        }

        if (rank != '' && rank != null) {
            query = query + ', ' + rank;
        }

        query = query + ');';

        return query;
    },

    to_insert_query_log_with_id: function (id, name, year, rank, dest_node, src_node) {
        var query = `INSERT INTO log_table(type, id, dest_node, src_node, replicated, name, year`;

        if (rank != '' && rank != null) {
            query = query + ', \`rank\`';
        }

        query = query + ") VALUES ('INSERT', " + id + ', ' + dest_node + ', ' + src_node + `, false, '` + name + `', ` + year;

        if (rank != '' && rank != null) {
            query = query + ', ' + rank;
        }

        query = query + ');';

        return query;
    },

    to_update_query_log: function (id, name, year, rank, dest_node, src_node) {
        var query = `INSERT INTO log_table(type, dest_node, src_node, replicated, id`;

        if (name != '' && name != null) {
            query = query + ', name';
        }

        if (year != '' && year != null) {
            query = query + ', year';
        }

        if (rank != '' && rank != null) {
            query = query + ', \`rank\`';
        }

        query = query + ") VALUES ('UPDATE', " + dest_node + ", " + src_node + ", false, " + id;

        if (name != '' && name != null) {
            query = query + ', \'' + name + '\'';
        }

        if (year != '' && year != null) {
            query = query + ', ' + year;
        }

        if (rank != '' && rank != null) {
            query = query + ', ' + rank;
        }

        query = query + ");";
        console.log(query);

        return  query;
    },

    to_update_query_id_log: function (new_id, old_id, dest_node, src_node) {
        var query = `INSERT INTO log_table(type, dest_node, src_node, replicated, id, new_id`;
        
        query = query + ") VALUES ('UPDATE', " + dest_node + ", " + src_node + ", false, " + old_id + ", " + new_id;
        
        query = query + ");";
        console.log(query);

        return query;
    },

    to_delete_query_log: function (id, dest_node, src_node) {
        return `INSERT INTO log_table(type, dest_node, src_node, replicated, id) VALUES ('DELETE', `
            + dest_node + `, ` + src_node + `, false, ` + id + `);`;
    },

    to_finish_log: function (id) {
        return `UPDATE log_table SET replicated=1 WHERE replicated_id=` + id + `;`;
    },
    
    to_retrieve_logs: function (node) {
        const now = DateTime.now().toObject()
        var year = "" + now.year;

        var month = "" + now.month;
        if (month < 10) month = "0" + month;
        
        var day = "" + now.day;
        if (day < 10) day = "0" + day;
        
        var hour = "" + now.hour;
        if (hour < 10) hour = "0" + hour;
        
        var minute = "" + now.minute;
        if (minute < 10) minute = "0" + minute;

        var second = "" + now.second;
        if (second < 10) second = "0" + second;
        
        return `SELECT * FROM log_table
                WHERE replicated=false AND dest_node=`+ node + ` AND date < '` + year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + `' 
                ORDER BY date ASC;`
    },

    to_get_next_id: function () {
        return `SELECT \`auto_increment\` FROM INFORMATION_SCHEMA.TABLES WHERE table_name = 'movies';`;
    },

    to_select_for_update: function (id) {
        return `SELECT * FROM movies WHERE id=` + id + ` FOR UPDATE;`
    },

    to_select_for_shared: function (id) {
        return `SELECT * FROM movies WHERE id=` + id + ` FOR SHARED;`
    },
}
module.exports = query_funcs;
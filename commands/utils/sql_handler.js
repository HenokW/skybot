const SQLite = require("better-sqlite3");
const fs = require("fs");

/*
sqlDir - SQL directory
table - the name of the table within the desired database
identifier - the column used to seperate unique entries
index - the desired entry to be returned
*/
exports.getData = async function(client, sqlDir, table, identifier, index)
{
    try
    {
        var sqlFile = new SQLite(sqlDir);
        client.dataGetter = sqlFile.prepare(`SELECT * FROM ${table} WHERE ${identifier} = ?`);

        var dataEntry = await client.dataGetter.get(index);
        await sqlFile.close();

        return dataEntry;
    } catch(e) { client.emit("error", e); }
}

/*
sqlDir - SQL directory
table - the name of the table within the desired database
identifier - the column used to seperate unique entries
sqlColValues - SQL set statement
index - the desired entry to be returned
data - the new data set to replace our index
*/
exports.setData = async function(client, sqlDir, sqlColValues, data)
{
    try
    {
        var sqlFile = new SQLite(sqlDir);
        client.dataSetter = sqlFile.prepare(sqlColValues);

        client.dataSetter.run(data);
        await sqlFile.close();
    } catch(e) { client.emit("error", e); }
}

// **CURRENTLY ONLY SUPPORTS MODIFYING CHANNEL SETTINGS FILE** //
exports.createColumn = async function(client, options, dirInfo)
{
    //Arg check
    if(typeof options.name === 'undefined') throw ("Column name not passed as an object, 'name'");
    if(typeof options.type === 'undefined') throw ("Column type not passed as an object, 'type'");

    //Get how many files we would need to modify
    if(typeof dirInfo === 'undefined')
    {
        await fs.readdir("./SQL/guild_data/", async (err, files) => {
            if(err) throw err;

            var dirInfo = {
                count: files.length,
                files: files
            }
            return this.createColumn(client, options, dirInfo);
        });
    }
    else
    {
        var colName = options.name;
        var colType = options.type;
        for(var i = 0; i < dirInfo.count; i++)
        {
            try
            {
                var sqlFile = new SQLite(`./SQL/guild_data/${dirInfo.files[i]}/games/users/gamesStats.sqlite`);
                client.createColumnData = sqlFile.prepare(`ALTER TABLE data ADD COLUMN ${colName} ${colType} default 0`);
                client.createColumnData.run();

                sqlFile.close();
            } catch(e) { client.emit("error", e); }
        }
    }
}


//Merges an array of keys, and values to be used as an object compatible with SQLite
exports.merge = async function(keys, values)
{
    var obj = {};
    for (var i = 0; i < keys.length; ++i)
        obj[keys[i]] = values[i];

    return obj;
}

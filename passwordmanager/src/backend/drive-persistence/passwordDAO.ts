/**
 * Get all encrypted passwords
 * @param connection
 * @returns {Promise<void>}
 */
export async function getAllEntries(connection: any) : Promise<any>{
    try {
        const documents = await connection.platform.documents.get(
            'passwordManager.passwordmanager',
            {
                where: [
                    ['$ownerId', "==", connection.identity.getId().toString()]
                ],
            },
        );
        return documents

    } catch (e) {
        console.error('Something went wrong:', e);
        return false;
    }
}

/**
 * Get password to a specific index
 * @param connection
 * @param index
 * @returns {Promise<void>}
 */
export async function getEntryByIndex(connection: any, index: number): Promise<any>{
    const platform = connection.platform;

    // Retrieve the existing document
    const [document] = await platform.documents.get(
        'passwordManager.passwordmanager',
        { where: [['$ownerId', '==', connection.identity.getId().toString()],
                ['index', '==', index]] },
    );

    return document;
}

/**
 * Push a new entry to drive
 * @param connection
 * @param entry
 * @returns {Promise<void>}
 */
export async function createNewEntry(connection: any, entry: any): Promise<any>{
    const doc_properties = {
        index: entry.index,
        inputVector: entry.iv,
        authenticationTag: entry.authTag,
        payload: Buffer.from(entry.payload)
    };
    console.log("start creating a new entry on drive");
    try {

        //console.log("connection.identity: ", connection.identity);
        //console.log("doc_properties", doc_properties);
        const platform = connection.platform;
        const entry_document = await platform.documents.create(
            'passwordManager.passwordmanager',
            connection.identity,
            doc_properties,
        );
        //console.log("Document locally created");
        //console.log(entry_document);

        const documentBatch = {
            create: [entry_document],
        };

        //console.log("uploading");
        let result = await platform.documents.broadcast(documentBatch, connection.identity)
        console.log("uploaded");
        return result;
    } catch (e) {
        console.log(e);
        console.log(e.data.errors[0]);
        return false;
    }
}


/**
 * delete an entry from drive
 * @param connection
 * @param index
 * @returns {Promise<void>}
 */
export async function deleteEntry(connection: any, index: number){
    const platform = connection.platform;

    // Retrieve the existing document
    const [document] = await platform.documents.get(
        'passwordManager.passwordmanager',
        { where: [['$ownerId', '==', connection.identity.getId().toString()],
                    ['index', '==', index]] },
    );

    return platform.documents.broadcast({ delete: [document] }, connection.identity);
}
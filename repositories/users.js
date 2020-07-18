const fs = require('fs')
const crypto = require('crypto')
const util = require('util')

const scrypt = util.promisify(crypto.scrypt)

class UsersRepository {
    constructor(filename) {
        if(!filename){
            throw new Error('Creating a repository requires a filename')
        }
        this.filename = filename;
        try {
            fs.accessSync(this.filename) 
        } catch (err){
            fs.writeFileSync(this.filename, '[]')
        }
    }

    async getAll() {
        // Open data 
        const contents = await fs.promises.readFile(this.filename, {encoding: 'utf8'})
        // Parse data
        const data = JSON.parse(contents)
        // return parsed data
        return data;
    }

    async create(attrs) {
        // Create user id and secure pass
        attrs.id = this.randomId();
        const salt = crypto.randomBytes(8).toString('hex')
        const buff = await scrypt(attrs.password, salt, 64)

        //load json base
        const records = await this.getAll()        
        
        // add new user
        const record = {
            ...attrs,
            password: `${buff.toString('hex')}.${salt}`
        }
        records.push(record);
        
        // store file
        await this.writeAll(records)

        return record;
    }

    async comparePasswords(saved, supplied) {
        const [hashed, salt] = saved.split('.');
        const suppliedBuff = await scrypt(supplied, salt, 64);
        const suppliedHashed = suppliedBuff.toString('hex');
        return hashed === suppliedHashed;
    }

    async writeAll(records) {
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2))
    }
    
    randomId() {
        return crypto.randomBytes(4).toString('hex')
    }
    
    async getOne(id) {
        const records = await this.getAll()
        return records.find(record => record.id === id);
    }

    async delete(id) {
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id);
        await this.writeAll(filteredRecords);
    }

    async update(id, attrs) {
        const records = await this.getAll()
        const record = records.find(record => record.id === id);
        if (!record) throw new Error(`Record with id ${id} not found`)
        // Make changes to record
        Object.assign(record, attrs)
        await this.writeAll(records)
    }

    async getOneBy(filters) {
        const records = await this.getAll();

        for (let record of records) {
            let found = true;

            for (let key in filters) {
                if(record[key] !== filters[key]) {
                    found = false;
                }
            }
            if (found) return record;
        }
    }

}

module.exports = new UsersRepository('users.json')

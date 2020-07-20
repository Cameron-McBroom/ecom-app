const fs = require('fs')
const crypto = require('crypto')
const util = require('util')
const Repository = require('./respository')

const scrypt = util.promisify(crypto.scrypt)

class UsersRepository extends Repository {
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
}

module.exports = new UsersRepository('users.json')

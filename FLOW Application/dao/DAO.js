const { Pool } = require('pg');

class DAO {
    constructor({ host, port, database, username, password }) {
        this.pool = new Pool({
            host,
            port,
            database,
            user: username,
            password,
        });
    }

    async executeQuery(query, params) {
        const client = await this.pool.connect();
        try {
            const res = await client.query(query, params);
            return res.rows;
        } finally {
            client.release();
        }
    }

    printCredentials() {
        console.log({
            host: this.pool.options.host,
            port: this.pool.options.port,
            database: this.pool.options.database,
            username: this.pool.options.user,
            password: this.pool.options.password,
        });
    }

    async getUsers() {
        const client = await this.pool.connect();
        try {
            const res = await client.query("select user_id, full_name, email from users", []);
            return res.rows;
        } finally {
            client.release();
        }
    }


    async saveUser({ email, full_name }) {
        const client = await this.pool.connect();
        try {
            // Check if a user with the same email or full name already exists
            const checkUserQuery = "SELECT user_id, full_name, email FROM users WHERE full_name = $1 OR email = $2";
            const checkUserResult = await client.query(checkUserQuery, [full_name, email]);

            if (checkUserResult.rows.length === 0) {
                // Insert the new user if no such user exists
                const insertUserQuery = "INSERT INTO users (full_name, email) VALUES ($1, $2) RETURNING user_id, full_name, email";
                const insertUserResult = await client.query(insertUserQuery, [full_name, email]);
                return insertUserResult.rows[0];
            } else {
                // Return the existing user's data
                return checkUserResult.rows[0];
            }
        } finally {
            client.release();
        }
    }
    //TODO saveUser(user)
}

module.exports = { DAO };

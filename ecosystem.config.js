module.exports = {
    apps: [
        {
            name: 'games',
            exec_mode: 'cluster',
            instances: 'max',
            script: './.output/server/index.mjs',
            env: {
                "PORT": 3080,
                //NODE_ENV:"development"
            }
        }
    ]
}

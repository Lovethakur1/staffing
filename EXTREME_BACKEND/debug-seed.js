try {
    const seed = require('./prisma/seed.js');
} catch (e) {
    require('fs').writeFileSync('debug_error.log', e.stack || e.message);
    process.exit(1);
}

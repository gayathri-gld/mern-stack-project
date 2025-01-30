const express = require('express');
const router = express.Router();

//@rout GET api/post
//@desc Test router
//acess public
router.get('/', (req, res) => res.send('Post route'));

module.exports = router;
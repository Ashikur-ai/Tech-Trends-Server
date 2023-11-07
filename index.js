const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware  techMaster  
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bpilnp1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const blogCollection = client.db('Blog_DB').collection('blogs');
        const wishListCollection = client.db('Blog_DB').collection('wishlist');
        const commentCollection = client.db('Blog_DB').collection('comment');

        // for blog api 
        app.post('/addBlog', async (req, res) => {
            const blog = req.body;
            
            const result = await blogCollection.insertOne(blog);
            res.send(result);
        })

        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await blogCollection.findOne(query);
            res.send(result);
        })

        app.put('/updateBlog/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedBlog = req.body;
            const blog = {
                $set: {
                    url: updatedBlog.url,
                    blogName: updatedBlog.blogName,
                    email: updatedBlog.email,
                    category: updatedBlog.category,
                    long_description: updatedBlog.long_description,
                    short_description: updatedBlog.short_description
                }
            }

            const result = await blogCollection.updateOne(filter, blog, options);
            res.send(result);
        })

        // for wishlist 
        app.post('/addWishlist', async (req, res) => {
            const wishItem = req.body;
            const result = await wishListCollection.insertOne(wishItem);
            res.send(result);

        })

        app.get('/wishlist', async (req, res) => {
            
            let query = {};
            if (req.query?.email) {
                query = { user_email: req.query.email }
            }
            const result = await wishListCollection.find(query).toArray();
            res.send(result);
        })

        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await wishListCollection.deleteOne(query);
            res.send(result);
        })

        // for comment 
        app.post('/addComment', async (req, res) => {
            const comment = req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('tech server is running')
})

app.listen(port, () => {
    console.log(`tech trend is running on ${port}`);
})
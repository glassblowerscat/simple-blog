//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash");

require("dotenv").config({
  path: "variables.env"
});

const port = process.env.NODE_ENV === "development" ? 3000 : process.env.PORT;

const dbUri = (process.env.NODE_ENV === 'development') ? process.env.MONGODB_DEV_URI : `${process.env.MONGODB_PROTOCOL}://${process.env.MONGODB_USER}:${process.env.MONGODB_PW}@${process.env.MONGODB_ADDRESS}`;

mongoose.connect(dbUri, {
  useNewUrlParser: true
});

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(express.static("public"));

const aboutContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Enim blandit volutpat maecenas volutpat blandit aliquam etiam. Ultrices vitae auctor eu augue ut lectus. Tortor posuere ac ut consequat semper. Consectetur adipiscing elit pellentesque habitant. Risus nullam eget felis eget. Ut morbi tincidunt augue interdum velit. Egestas fringilla phasellus faucibus scelerisque eleifend. Sollicitudin ac orci phasellus egestas. Tempor orci eu lobortis elementum nibh. Non blandit massa enim nec dui nunc mattis.";

const contactContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. At erat pellentesque adipiscing commodo elit at. Bibendum at varius vel pharetra vel turpis nunc. Leo integer malesuada nunc vel risus commodo viverra. Enim blandit volutpat maecenas volutpat. Non consectetur a erat nam at lectus urna duis convallis. Risus in hendrerit gravida rutrum quisque. Mauris nunc congue nisi vitae suscipit tellus mauris a diam. Purus sit amet volutpat consequat mauris nunc. Consectetur a erat nam at lectus urna. Imperdiet proin fermentum leo vel orci porta non pulvinar. Sed risus ultricies tristique nulla aliquet enim. Sit amet porttitor eget dolor morbi non arcu risus. Congue quisque egestas diam in. Tellus elementum sagittis vitae et leo duis ut diam quam.";

const postSchema = {
  title: String,
  body: String,
  slug: String
}

const Post = mongoose.model('Post', postSchema);

app.get("/", (req, res) => {
  Post.find({}, (err, foundPosts) => {
    if (err) {
      console.error(err);
    } else {
      res.render("home", {
        posts: foundPosts
      });
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    aboutContent
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    contactContent
  });
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", async (req, res) => {
  const title = req.body.postTitle;
  const body = req.body.postBody.replace(new RegExp('\r?\n', 'g'), '<br />');
  const slug = _.kebabCase(req.body.postTitle);
  const post = new Post({
    title,
    body,
    slug
  });
  await post.save();

  res.redirect(`/posts/${slug}`);
});

app.get("/posts/:postName", (req, res) => {
  Post.findOne({ slug: req.params.postName }, (err, foundPost) => {
    if (err) {
      console.error(err);
    } else {
      if (!foundPost) {
        res.render('404');
      } else {
        res.render('post', {
          title: foundPost.title,
          body: foundPost.body
        });
      }
    }
  });
});

app.get('*', (req, res) => {
  res.status(404).render('404')
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(404).render('404')
});

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});

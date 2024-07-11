var express = require('express');
var router = express.Router();
var userModel = require('./users');
const passport = require('passport');
var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()));
const multer = require('./multer');
const upload = require('./multer');
const postModel = require('./post')
const boardModel =require('./board');
const board = require('./board');
const CommentModel = require('./comment');
const comment = require('./comment');

router.get('/', function(req,res, next) {
  res.render('index', {nav: false})
})

router.get('/register',function(req, res, next) {
  res.render('register', {nav: false})
});

router.post('/fileupload', IsLoggedIn, upload.single("image"),async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  console.log(req.file.filename)
  if(req.file) {
    user.profileImage = req.file.filename;
    await user.save();
  }



  res.redirect("/profile")
})

router.get('/pin/:PostId', IsLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user}).populate('boards')
  const postid = req.params.PostId

  const Post = await postModel.findById(postid)
      .populate({
        path: 'user',
        model: 'User',
      }) // Populate the user field in the Post schema
      .populate({
        path: 'Comments',
        populate: {
          path: 'user',
          model: 'User',
        },
      })
      .exec();


  res.render('see_pin',{nav: true,user,Post})
})

router.get("/username/:PostName", IsLoggedIn, async function(req, res) {
  const regex = new RegExp(`${req.params.PostName}`, 'i');
  const user = await userModel.find({username: regex})
  res.json(user)
})

router.post('/follow/:FollowUserId', IsLoggedIn, async function(req, res) {
  const FollowedUserId = req.params.FollowUserId;
  const user = await userModel.findOne({ username: req.session.passport.user })

  const FollowedUser = await userModel.findById(FollowedUserId)

  const indexOfPost = FollowedUser.followers.findIndex(followers => followers.equals(user._id));

  if(indexOfPost === -1) {

    FollowedUser.followers.push(user._id)
    user.followings.push(FollowedUser._id)
    await FollowedUser.save()
    await user.save()

  }
  else {
    FollowedUser.followers.splice(indexOfPost, 1)
    user.followings.splice(indexOfPost, 1)

    await FollowedUser.save()
    await user.save()
  }
  
  res.redirect(`/User/${FollowedUserId}/${FollowedUser.username}`)  
})

router.post('/follow/:FollowUserId/:PostID', IsLoggedIn, async function(req, res) {
  const FollowedUserId = req.params.FollowUserId;
  const user = await userModel.findOne({ username: req.session.passport.user })

  const PostId = req.params.PostID
  const FollowedUser = await userModel.findById(FollowedUserId)

  const indexOfPost = FollowedUser.followers.findIndex(followers => followers.equals(user._id));

  if(indexOfPost === -1) {

    FollowedUser.followers.push(user._id)
    await FollowedUser.save()

  }
  else {
    FollowedUser.followers.splice(indexOfPost, 1)
    await FollowedUser.save()
  }
  

  res.redirect(`pin/${PostId}`)  
})

router.post('/comment/:PostId', IsLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user})
  const postid = req.params.PostId
  
  const Post = await postModel.findById(postid)

  const Comment = await CommentModel.create({
    user: user._id,
    post: Post._id,
    Comment : req.body.comment
  })

  Post.Comments.push(Comment._id)
  await Post.save()

  res.redirect(`/pin/${postid}`)
})


router.get('/profile/_saved', IsLoggedIn,async function(req, res, next) {
  // const user = await userModel.findOne({username: req.session.passport.user}).populate('posts boards')


  const user = await userModel.findOne({username: req.session.passport.user})
  .populate({
    path: 'boards',
    populate: {
      path: 'posts',
      model: 'Post',
    },
  })
  .populate('posts boards.posts')  // Populate the posts field in the User schema
  .exec();
  const boards = await boardModel.find().populate('posts')
  res.render('profile', {user, nav:true, boards})

})

router.get('/settings/edit',IsLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('edit',{user, nav: true})
})

router.get('/User/:UserId', IsLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('boards')
  const SelectedUserId = req.params.UserId;
  const selectedUser = await userModel.findById(SelectedUserId).populate('posts');

  res.render('see_user', {user, nav:true, selectedUser})
})

router.get('/User/:UserId/:Username', IsLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('boards')
  const SelectedUserId = req.params.UserId;
  const selectedUser = await userModel.findById(SelectedUserId).populate('posts');

  res.render('see_user', {user, nav:true, selectedUser})
})

router.post('/editProfile', upload.single("fileImage"),IsLoggedIn, async function(req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user},
    { username: req.body.username, bio: req.body.bio, name: req.body.name},
    { new: true}
  );

  if(!user.profileImage) {
    user.profileImage = ""
  }

  if(req.file) {
    user.profileImage = req.file.filename
  }
    await user.save()

  req.login(user, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    // Redirect to a specific page after successful login
    res.redirect('/profile/_saved');
  });

  // res.redirect('/profile/_saved')
})

router.get('/profile/_created', IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts')
  res.render('Profile_created', {user, nav:true})
})

router.get('/create/board', IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts')
  res.render('create-board', {user, nav:true})
})

router.get('/show/posts', IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts')
  res.render("show", {user, nav: true})
})

router.post('/save/:postID', IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts boards')

  const PostId = req.params.postID;
  const PostToSave = await postModel.findById(PostId);
  const selectedBoardId = req.body.selectedBoard;

  const selectedBoard = await boardModel.findById(selectedBoardId)

  const indexOfPost = selectedBoard.posts.findIndex(post => post.equals(PostToSave._id));

  if(indexOfPost === -1) {

    selectedBoard.posts.push(PostToSave._id)
    await selectedBoard.save()

  }
  else {
    selectedBoard.posts.splice(indexOfPost, 1)
    await selectedBoard.save()
  }
  
  res.redirect(`/pin/${PostId}`)

})

router.post('/Feed/save/:postID', IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts boards')

  const PostId = req.params.postID;
  const PostToSave = await postModel.findById(PostId);
  const selectedBoardId = req.body.selectedBoard;

  const selectedBoard = await boardModel.findById(selectedBoardId)

  const indexOfPost = selectedBoard.posts.findIndex(post => post.equals(PostToSave._id));

  if(indexOfPost === -1) {

    selectedBoard.posts.push(PostToSave._id)
    await selectedBoard.save()

  }
  else {
    selectedBoard.posts.splice(indexOfPost, 1)
    await selectedBoard.save()
  }
  
  res.redirect(`/feed`)

})

router.post('/User/save/:postID', IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts boards')

  const PostId = req.params.postID;
  const PostToSave = await postModel.findById(PostId).populate('user')
  const selectedBoardId = req.body.selectedBoard;

  const selectedBoard = await boardModel.findById(selectedBoardId)

  const indexOfPost = selectedBoard.posts.findIndex(post => post.equals(PostToSave._id));

  if(indexOfPost === -1) {

    selectedBoard.posts.push(PostToSave._id)
    await selectedBoard.save()

  }
  else {
    selectedBoard.posts.splice(indexOfPost, 1)
    await selectedBoard.save()
  }
  
  res.redirect(`/User/${PostToSave.user._id}/${PostToSave.user.username}`)

})

router.get('/feed', IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('boards')
  const posts = await postModel.find().populate("user")

  res.render("feed", {user, posts, nav: true,})
})

router.get('/add', IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render("add", {user, nav: true})
});

router.post('/create/board',IsLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('boards')

  if (!user.boards) {
    // Initialize boards as an empty array if it doesn't exist
    user.boards = [];
  }

  const Board = await boardModel.create({
    owner: user._id,
    boardName: req.body.boardName,
  })
  user.boards.push(Board._id)
  await user.save()
  res.redirect('/profile/_saved')
});

router.post('/createpost', upload.single("postimage"), IsLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });

  if(req.file) {

    const post = await postModel.create({
      user: user._id,
      Title: req.body.title,
      description: req.body.description,
      image: req.file.filename
    });
  
    user.posts.push(post._id);
    await user.save();
  }



  res.redirect("/profile/_created")

});

router.post('/register', function(req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.fullname
  });

  userModel.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile/_created")
    })
  })
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile/_saved",
}),function(req, res, next) {})

router.get("/logout", function(req, res, next) {
  req.logOut(function(err) {
    if (err) { return next(err);}
    res.redirect("/")
  })
})

function IsLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect("/")
}




module.exports = router;

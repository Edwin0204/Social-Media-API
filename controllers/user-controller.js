const { User, Thought } = require('../models');

const userController = {
    
    getAllUser(req, res) {
        User.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.sendStatus(400);
            });
    },

    
    getUserById({ params }, res) {
        User.findOne({ _id: params.userId })
            .populate({
                path: 'thoughts',
                select: '-__v'
            })
            .populate({
                path: 'friends',
                select: '-__v'
            })
            .select('-__v')
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.sendStatus(400);
            });
    },
   
    addUser({ params, body }, res) {
        console.log(params);
        User.create(body)
            .then(dbUserData => {
                console.log(dbUserData);
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
    },

    
    addFriend({ params, body }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            { $push: { friends: params.friendId } },
            { new: true, runValidators: true }
        )
            .then(dbFriendData => {
                if (!dbFriendData) {
                    res.status(404).json({ message: 'Data not found' });
                    return;
                }
                res.json(dbFriendData);
            })
            .catch(err => res.json(err));
    },
    
    updateUser({ params, body }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            { $set: body },
            { new: true, runValidators: true }
        )
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'Data not found' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
    },

   
    removeUser({ params }, res) {
        User.findOneAndDelete({ _id: params.userId })
            .then(deletedUser => {
                if (!deletedUser) {
                    return res.status(404).json({ message: 'Data not found' });
                }
                return Thought.deleteMany({ _id: { $in: deletedUser.thoughts } })
            }).then(() => {
                res.json({ message: "User and associated thoughts have been deleted!" })
            })
            .catch(err => res.json(err));
    },
   
    removeFriend: async(req,res)=>{
        try{
            const removeFriend = await User.findOneAndUpdate(
                {_id: req.params.userId},
                {$pull: {friends: req.params.friendId}},
                {runValidators: true, new: true},
            );
            res.status(200).json(removeFriend);
        }catch(err){
            res.status(500).send({message: 'Friend not added'})
        }
    }
};

module.exports = userController;
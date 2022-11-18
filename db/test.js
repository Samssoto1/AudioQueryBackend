mongoose=require('./connection')
//console.log(mongoose);
const test = new mongoose.Schema({
  name: String
});
const mtest = mongoose.model('Test', test);
//const w = new mtest({ name: 'Hi, another test' })
//w.save();
mtest.findOne({'name':'Hi, other test'},{},
  function(err, resp){
    console.log(resp);
  }
);
mtest.find({},{},
  function(err, resp){
    console.log(resp);
  }
);
module.exports = undefined;

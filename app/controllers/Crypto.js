"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = mongoose.model("Transaction");
const User = mongoose.model("User");
const Project = mongoose.model("Project");
const Helper = require('../helper/helper');

const helper = new Helper()

// const Web3 = require("web3");

// const rinkebynet = process.env.REACT_APP_RINKEBYNET,
//   ropstentest = process.env.REACT_APP_ROPSTENNET,
//   kovannet = process.env.REACT_APP_KOVANNET,
//   mainnet = process.env.REACT_APP_MAINNET;

// const web3 = new Web3();
// web3.setProvider(new web3.providers.HttpProvider(mainnet));

// exports.confirmTransaction = async (req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");

//   try {
//     let transaction = await web3.eth.getTransaction(req.body.hash);
//     // Get current block number
//     web3.eth.getBlockNumber(async (err, num) => {
//       try {
//         if (num && transaction) {
//           const confirmations = num - transaction.blockNumber;
//           if (Number(confirmations) > 30) {
//             let objToSave = {
//               value: transaction.value / 1.0e18,
//               receiver: transaction.to,
//               sender: transaction.from,
//               hash: req.body.hash,
//               currency: "Ether",
//               blockNumber: transaction.blockNumber,
//               project: req.body.projectId,
//               memo: transaction.memo,
//               status: "CONFIRMED"
//             };

//             let check = await Transaction.findOne({
//               hash: req.body.hash,
//               project: req.body.projectId
//             });

//             if (Boolean(check) === false) {
//               console.log("made it here");
//               let saveRequest = await new Transaction(objToSave).save();

//               let project = await Project.findOne({
//                 _id: req.body.projectId
//               });

//               let projectTransactions = project.toJSON();
//               projectTransactions = projectTransactions.transactions;

//               if (projectTransactions.length > 0) {
//                 projectTransactions = projectTransactions.map(t => {
//                   return t._id;
//                 });
//               }
//               let saveToProjectRequest = await Project.updateOne(
//                 {
//                   _id: req.body.projectId
//                 },
//                 {
//                   $set: {
//                     transactions: [...projectTransactions, saveRequest._id]
//                   }
//                 }
//               );

//               // console.log({
//               //   transactions: [...projectTransactions, saveRequest._id]
//               // });

//               if (Boolean(saveToProjectRequest.n)) {
//                 return res.status(200).json({
//                   success: true,
//                   message: "This Transaction Has Been Confirmed"
//                 });
//               } else {
//                 return res.status(424).json({
//                   success: false,
//                   message: "This Transaction Has Not Been Confirmed"
//                 });
//               }
//             } else {
//               return res.status(409).json({
//                 success: false,
//                 message: "This Transaction Has Already Been Recorded"
//               });
//             }
//           }
//         } else {
//           return res.status(403).json({
//             success: false,
//             message:
//               "This Transaction Has Not Obtained Adequate Block Confirmations."
//           });
//         }
//       } catch (error) {
//         return res.json({
//           success: false,
//           message: error.message
//         });
//       }
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.message
//     });
//   }
// };


class Crypto {
  constructor() {
    this.nativeBalances = [];
    this.projectRelatedBalances = [];
    this.CreatedProjects = [];
    this.joinedProjects = [];
    this.CreatedProjectBalances = [];
    this.joinedProjectBalances = [];
    this.user = '';
    this.PSTAssets;
  }


  async getBalances(req, res) {

    try {
      this.user = req.userId;
      // const { projectId } = req.query;

      let user = await User.findById(this.user);

      if (user == null || user == undefined) {
        return res.status(404).json({ message: "user not found" })
      }

      const role = helper.getRole(user);

      let token = req.token;

      const balances = await helper.getWalletBalance(token, user.publicKey);
      let projects = await Project.find({ $or: [{ owner: this.user }, { 'stakeholders.user.information': this.user, 'stakeholders.user.status': 'ACCEPTED' }] },
        {
          'transactions': 0, 'documents': 0, "observationBudget": 0, 'proposals': 0, 'tags': 0,
          '"project-avatar': 0, 'endDate': 0, 'implementationBudget': 0, 'issuingAccount': 0, 'distributionAccount': 0, 'raised': 0,
          'status': 0, 'numOfevaluators': 0, 'location': 0, 'startDate': 0, 'description': 0
        });

      if (projects.length < 1) {
        return res.status(200).json({ balances })
      }

      // seperate owned and joined projects
      projects.forEach((project) => {
        if (project.owner._id.toString() === this.user) {
          this.CreatedProjects.push(project);
        } else {
          this.joinedProjects.push(project);
        }
      });


      // extract native balance

      if (balances.balances.success && balances.balances.success == true) {
        const balance = balances.balances.balances;

        this.nativeBalances = balance.filter(balance => balance.type === "native" || !balance.token.includes('PST'));
        this.PSTAssets = balance.filter(balance => balance.type !== "native" && balance.token.includes('PST'));

        if (this.CreatedProjects.length > 0) {
          this.CreatedProjectBalances = this.CreatedProjects.map(async (project) => {
            return {
              _id: project._id,
              name: project.name,
              balances: await helper.getProjectBalancesOrhistory(project._id, token, false)
            }
          })
        }

        this.CreatedProjectBalances = await Promise.all(this.CreatedProjectBalances);

        if (this.joinedProjects.length > 0) {
          for (let PSTAsset of this.PSTAssets) {
            for (let project of this.joinedProjects) {
              if (PSTAsset.token.toString() === project.pst.toString()) {
                this.joinedProjectBalances.push(
                  {
                    _id: project._id,
                    name: project.name,
                    type: PSTAsset.type,
                    token: project.pst,
                    balance: PSTAsset.balance
                  }
                )
              }
            }
          }
        }

        return res.json({
          native_balance: this.nativeBalances,
          joinedProjects: this.joinedProjectBalances,
          createdProjects: this.CreatedProjectBalances
        })

        // return res.status(balances.status).json({ success: balances.balances.success, balances: balances.balances.balances, link: balances.balances.links.self.href })
      } else {
        return res.status(400).json({ message: "Could not retrieve wallet balances" })
        // return res.status(400).json({message:balances.message})
      }

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "internal server error" })
    }

  }


  async getTransactions(req, res) {
    const { id } = req.params
    this.user = req.userId

    try {
      let the_user = User.findById(this.user);
      let the_project = Project.findOne({ _id: id });
  
      const [user, project] = await Promise.all([the_user, the_project])
  
      if (project == null || project == undefined) {
        return res.status(404).json({ message: "Project not found" })
      }
  
      let projectOwner = project.owner._id.toString();
  
      const isProjectOwner = projectOwner === this.user.toString();
  
      let transactions;
  
      switch (isProjectOwner) {
        case true:
          transactions = await Transaction.find({ project: project._id })
            .populate({ path: 'receiver', select: 'firstName lastName' })
            .populate({ path: 'sender', select: 'firstName lastName' });
          return res.status(200).json({ transactions });
  
        case false:
        let tokenBalance={};
          let walletBalance = await helper.getWalletBalance(req.token, user.publicKey)
          if(walletBalance.balances.success && walletBalance.balances.success == true){
            tokenBalance = walletBalance.balances.balances.find(token => token.token.toString() === project.pst);
          }
  
          transactions = await Transaction.find({ project: project._id, receiver: req.userId })
            .populate({ path: 'receiver', select: 'firstName lastName' })
            .populate({ path: 'sender', select: 'firstName lastName' })
          // .populate('modelId');
          return res.status(200).json({ projectName:project.name,pst:tokenBalance,transactions });
        default:
          break;
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "internal server error" })
    }
   
  }
}


module.exports = new Crypto();
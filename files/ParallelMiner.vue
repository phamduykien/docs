<template>
  <el-row justify="start" :gutter="10">
    <el-col :span="3">
      <el-button-group>
        <el-button type="primary" size="mini" @click="upload">Upload</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="initPool"
          :disabled="!canInit"
          >Init</el-button
        >
      </el-button-group>
    </el-col>
    <el-col :span="3">
      <el-switch
        class="schedule-button"
        :disabled="!canMine"
        v-model="mining"
        active-text="Runing"
        inactive-text="Pause"
      ></el-switch>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-table :data="accounts" class="account-table" height="400">
        <el-table-column fixed prop="displayName" label="Name" width="250" />
        <el-table-column fixed prop="accountName" label="Account" width="120" />
        <el-table-column fixed prop="token" label="Token" width="150">
          <template #default="scope">
            <span>{{ formatToken(scope.row.token) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="delay" label="Delay" width="100" />
        <el-table-column prop="balance" label="Balance" width="100" />
        <!-- <template #default="scope">
            <span>{{ formatTLM(scope.row.balance) }}</span>
          </template> -->

        <el-table-column prop="nextMineTime" label="Next Mine" width="200">
          <template #default="scope">
            <span>{{ formatDate(scope.row.nextMineTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" />
        <el-table-column prop="lastMineAmount" label="Last Mine" width="120" />
        <!-- <template #default="scope">
            <span>{{ formatTLM(scope.row.lastMineAmount) }}</span>
          </template> -->

        <el-table-column prop="lastMineTime" label="Last Time" width="200">
          <template #default="scope">
            <span>{{ formatDate(scope.row.lastMineTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>


<script>
/* eslint-disable*/
import { Constants } from "../constants";
import MineService from "../service/MinerDataService";
import * as waxjs from "@waxio/waxjs/dist";
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig");
import { ElMessage } from "element-plus";
export default {
  props: {
    // wax: {
    //   type: waxjs.WaxJS,
    // },
  },
  data() {
    return {
      mining: false,
      canInit: true,
      canFetch: false,
      canMine: false,
      accounts: [],
      // accounts: [
      //   {
      //     displayName: "tunglam.kid.01@gmail.com",
      //     accountName: "k2djm.wam",
      //     token: "bGo7oFlkXrFgU3GfMQZ4cenA4L1msI6En6eP7a3x",
      //     balance: "0 TLM",
      //     delay: 0,
      //     remainDelay: 0,
      //     nextMineTime: null,
      //     status: "Waiting",
      //     lastMineAmount: "0 TLM",
      //     lastMineTime: null,
      //     publicKey: "EOS6WmVAZsj7gTWJcvQRt8HnBH2DoaNN6dhZyFvWCvMzKomZxZVf3",
      //     coPublicKey: "EOS8UhZSLGoiUSifugc4x2LrLbKW6GwKKNzJbxtZBBChqcKbfV18G",
      //   },
      //   {
      //     displayName: "phamnguyentunglam88@gmail.com",
      //     accountName: "lqcjm.wam",
      //     token: "UQVQlXaj3fDOZWaGIEj7ZD5q9Eq9HLfL2I1h3V6e",
      //     balance: "0 TLM",
      //     delay: 0,
      //     remainDelay: 0,
      //     nextMineTime: null,
      //     status: "Waiting",
      //     lastMineAmount: "0 TLM",
      //     lastMineTime: null,
      //     publicKey: "EOS7RXzy3N9tCMtTkFsNc6Y4WPU65oucPKyLz3oAETi9F6vHmEysE",
      //     coPublicKey: "EOS8UhZSLGoiUSifugc4x2LrLbKW6GwKKNzJbxtZBBChqcKbfV18G",
      //   },
      // ],
      pool: {
        name: "hthgdfg435hf",
        privateKey: "5J7N95KYuLaiTicByVTodEMphrfLPspTcZhVqU5BtYFcVFPxn3V",
        pubKey: "EOS8Zkfrg1Ju84vsSp8VFNnaHmeN4osvcJRiEGaSLumQqgAQC7oMo",
        key: "d806f7Rdfa747I58G4958d9a15Yv37c",
        id: "61a8536a93a5a5d7fbc436a0",
        version: 0,
        createDate: "2021-12-05T02:49:26.297+00:00",
      },
      dicJs: {},
      wax: null,
    };
  },
  watch: {
    mining(value) {
      if (value) {
        this.scheduleCheck();
      }
    },
  },
  mounted() {},
  methods: {
    /**
     * Định dạng lại ngày tháng
     */
    formatDate(value) {
      if (!value) return "";
      let dateText = value.toLocaleString();
      return dateText;
    },
    /**
     * Định dạng token ẩn thông tin
     */
    formatToken(token) {
      if (!token || token.length < 10) return token;
      return (
        token.substring(0, 5) +
        "..." +
        token.substring(token.length - 6, token.length - 1)
      );
    },
    /**
     * Upload tài khoản
     */
    upload() {
      let me = this,
        input = document.createElement("input");
      input.type = "file";
      input.onchange = (_) => {
        // you can use this method to get file and perform respective operations
        let files = Array.from(input.files);
        var reader = new FileReader();
        reader.onload = function (e) {
          //console.log("File content:", e.target.result);
          let jsonAccount = eval(e.target.result);
          me.accounts = jsonAccount;
        };
        reader.readAsText(files[0]);
      };
      input.click();
    },
    /**
     * Fetch info account realtime
     */
    async fetchInfo() {
      if (this.accounts && this.accounts.length > 0) {
        let svc = new MineService(this.wax),
          arr = [];
        this.accounts.forEach(async (acc) => {
          let delayP = svc.getMineDelay(acc.accountName).then((res) => {
            acc.delay = res;
            this.setNextMineTime(acc, res);
          });
          arr.push(delayP);
          let balanceP = svc.getBalance(acc.accountName).then((res) => {
            acc.balance = res;
          });
          arr.push(balanceP);
        });
        //Tất cả task xong thì resolve để enable nút đào
        return Promise.all(arr);
      } else {
        return Promise.resolve(false);
      }
    },
    /**
     * Thiết lập lần mine tiếp
     */
    setNextMineTime(account, delay) {
      let now = new Date();
      let random = this.getRandom(20000, 50000);
      let next = now.getTime() + delay + random;
      let nextTime = new Date(next);
      account.nextMineTime = nextTime;
    },
    getRandom(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    },
    /**
     * Init pool account
     */
    async initPool() {
      if (this.pool) {
        this.canInit = false;
        const privateKey = this.pool.privateKey;
        const signatureProvider = new JsSignatureProvider([privateKey]);
        const authorityProvider = {
          getRequiredKeys: async () => [this.pool.pubKey],
        };

        if (this.accounts && this.accounts.length > 0) {
          for (let i = 0; i < this.accounts.length; i++) {
            const acc = this.accounts[i];
            //Tạo js
            let wax = null;
            if (this.pool.accountName && this.pool.pubKeys) {
              wax = new waxjs.WaxJS({
                rpcEndpoint: Constants.Endpoin.RpcEndpoin,
                userAccount: this.pool.accountName,
                pubKeys: this.pool.pubKeys,
                tryAutoLogin: false,
                apiSigner: signatureProvider,
                eosApiArgs: { authorityProvider: authorityProvider },
              });
            } else {
              wax = new waxjs.WaxJS({
                rpcEndpoint: Constants.Endpoin.RpcEndpoin,
                tryAutoLogin: false,
                apiSigner: signatureProvider,
                eosApiArgs: { authorityProvider: authorityProvider },
              });
            }

            if (wax) {
              let account = {
                account: acc.accountName,
                keys: [acc.publicKey, acc.coPublicKey],
              };

              if (wax.signingApi) {
                wax.signingApi.accessToken = acc.token;
                wax.signingApi.signUrl =
                  localStorage.getItem("signUrl") || "/wam/sign";
              }
              wax.receiveLogin(account);
              this.dicJs[acc.accountName] = wax;
              //set 1 js để dùng chung
              this.wax = wax;
            }
          }
        }
        this.canFetch = true;
        //debugger
        this.fetchInfo().then((res) => {
          if (res) {
            this.canMine = true;
          }
        });
      }
    },
    /**
     * Mine token
     */
    mine() {
      this.scheduleCheck();
      // if (this.accounts && this.accounts.length > 0) {
      //   this.accounts.forEach(async (acc) => {
      //     let svc = new MineService(this.dicJs[acc.accountName]);
      //     if (acc.remainDelay <= 0) {
      //       await svc.mine(this.pool.name, acc.accountName);
      //     }
      //   });
      // }
    },
    scheduleCheck() {
      let task = setInterval(async () => {
        if (!this.mining) {
          clearInterval(task);
        }
        for (let i = 0; i < this.accounts.length; i++) {
          const acc = this.accounts[i];
          const time = new Date();
          if (
            time >= acc.nextMineTime &&
            (!acc.status || acc.status == "Waiting")
          ) {
            let svc = new MineService(this.dicJs[acc.accountName]);
            acc.status = "Mining";
            //Tiến hành đào nếu lỗi thì trả message
            svc
              .mine(this.pool.name, acc.accountName)
              .then((res) => {
                acc.lastMineTime = new Date();
                acc.status = "Done";
                setTimeout(() => {
                  //Delay 1 chút rồi cập nhật trạng thái vì server chưa kịp cập nhật
                  svc.getBalance(acc.accountName).then((res) => {
                    acc.lastMineAmount =
                      (parseFloat(res) - parseFloat(acc.balance)).toFixed(4) +
                      " TLM";
                    acc.balance = res;
                  });
                  svc.getMineDelay(acc.accountName).then((res) => {
                    this.setNextMineTime(acc, res);
                    acc.status = "Waiting";
                  });
                }, 6000);
              })
              .catch((err) => {
                this.mining = false;
                acc.status = "Error";
                this.showMessage("Fail: " + error, "error");
                console.error(error);
              });
          } else {
          }
        }
      }, 5000);
    },
    showMessage(message, type) {
      ElMessage({
        showClose: true,
        message: message,
        type: type || "success",
      });
    },
  },
};
</script>
<style lang="css" scoped>
.schedule-button {
  margin-top: 6px;
}
.account-table {
  width: 100%;
  height: 400px;
}
</style>
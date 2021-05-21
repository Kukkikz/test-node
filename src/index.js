const express = require("express");
const basicAuth = require("express-basic-auth");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;


app.use(basicAuth({
    users: { "wallet": "0xea48756191568c83793ed10fb45b37482a84fb4a" },
}));

app.get("/", (req, res) => {
    axios.get("https://api.apeboard.finance/dopple/0xeA48756191568c83793ed10fB45B37482A84fb4a")
        .then((response) => {
            if (response.data.statusCode == 500) {
                res.status(400).send("Invalid ID");
            }
            let doppleValue = 0;
            doppleValue = response.data.farms[0].tokens[0].balance * response.data.farms[0].tokens[0].price + response.data.farms[0].rewards[0].balance * response.data.farms[0].rewards[0].price;
            // doppleValue = response.data.farms[0].tokens[0].balance * response.data.farms[0].tokens[0].price +
            console.log("doppleValue = " + doppleValue);

            axios.get("https://api.apeboard.finance/alpaca/0xeA48756191568c83793ed10fB45B37482A84fb4a")
                .then((response) => {
                    if (response.data.statusCode == 500) {
                        res.status(400).send("Invalid ID");
                    }
                    let alpacaValue = 0;
                    alpacaValue = ((response.data.farms[0].tokens[0].balance * response.data.farms[0].tokens[0].price) + (response.data.farms[0].tokens[1].balance * response.data.farms[0].tokens[1].price)) - response.data.farms[0].debtValue + (response.data.stakings[0].rewards[0].price * response.data.stakings[0].rewards[0].balance);
                    console.log("alpacaValue = " + alpacaValue);

                    axios.get("https://api.apeboard.finance/alpha-homora/bsc/0xeA48756191568c83793ed10fB45B37482A84fb4a")
                        .then((response) => {
                            if (response.data.statusCode == 500) {
                                res.status(400).send("Invalid ID");
                            }
                            let alphaValue = 0;
                            if (response.data.farms[0].debtValue > 0) {
                                alphaValue = ((response.data.farms[0].tokens[0].balance * response.data.farms[0].tokens[0].price) + (response.data.farms[0].tokens[1].balance * response.data.farms[0].tokens[1].price)) - response.data.farms[0].debtValue;
                                console.log("alphaValue = " + alphaValue);
                            }

                            axios.get("https://api.apeboard.finance/wallet/bsc/0xeA48756191568c83793ed10fB45B37482A84fb4a")
                                .then((response) => {
                                    if (response.data.statusCode == 500) {
                                        res.status(400).send("Invalid ID");
                                    }
                                    let wardenTotalValue = 0;
                                    let safeBscValue = 0;

                                    for (let i = 0; i < response.data.length; i++) {
                                        if (response.data[i].name == "warden") {
                                            wardenTotalValue = response.data[i].balance * response.data[i].price;
                                        } else if (response.data[i].name == "SafeBSC") {
                                            safeBscValue = response.data[i].balance * response.data[i].price;
                                        }
                                    }
                                    console.log("Warden wallet = " + wardenTotalValue);
                                    console.log("SafeBSC wallet = " + safeBscValue);

                                    axios.get("https://www.yieldwatch.net/api/all/0xea48756191568c83793ed10fb45b37482a84fb4a?platforms=pancake,auto,bunny")
                                        .then((response) => {
                                            console.log(response.data);
                                            if (response.data.status == "0") {
                                                res.status(400).send("Invalid ID");
                                            }

                                            // Get Today Date
                                            const ts = Date.now();
                                            const dateOb = new Date(ts);
                                            const date = dateOb.getDate();
                                            const month = dateOb.getMonth() + 1;
                                            const year = dateOb.getFullYear();

                                            // Get Yield
                                            // const pancakeSwapLp = response.data.result.PancakeSwap.LPStaking.totalUSDValues;
                                            // const pancakeSwapStake = response.data.result.PancakeSwap.staking.totalUSDValues;
                                            const autoFarm = response.data.result.Autofarm.vaults.totalUSDValues;
                                            const autoVault = response.data.result.Autofarm.LPVaults.totalUSDValues;
                                            const bunnyFarm = response.data.result.bunny.LPStaking.totalUSDValues;
                                            const bunnyVault = response.data.result.bunny.vaults.totalUSDValues;

                                            const wallet = response.data.result.walletBalance.totalUSDValue;

                                            // console.log("Pancake = " + pancakeSwapLp.total+pancakeSwapStake.total);
                                            console.log("Auto Farm = " + autoFarm.total);
                                            console.log("Auto Vault = " + autoVault.total);
                                            console.log("Bunney Farm = " + bunnyFarm.total);
                                            console.log("Bunney Vault = " + bunnyVault.total);
                                            console.log("Wallet = " + wallet);

                                            const value = {
                                                "date": `${month}/${date}/${year}`,
                                                "netWorthUSD": autoFarm.total + autoVault.total + wallet + wardenTotalValue + safeBscValue + alphaValue + bunnyFarm.total + bunnyVault.total + alpacaValue + doppleValue,
                                                "depositUSD": autoFarm.deposit + autoVault.deposit + bunnyFarm.deposit,
                                                "yieldUSD": autoFarm.yield + autoVault.yield + bunnyFarm.yield,
                                            };

                                            console.log(value);


                                            res.status(200).send(value);
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(500).send("error yieldwatch");
                                        });
                                })
                                .catch((error) => {
                                    console.log(error);
                                    res.status(500).send("error ape wallet");
                                });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500).send("error Alpha Homura");
                        });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).send("error Alpaca");
                });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("error Dopple");
        });
});


console.log('Hello World');

//run web server ที่เราสร้างไว้ โดยใช้ PORT ที่เรากำหนดไว้ในตัวแปร PORT
app.listen(PORT, () => {
    //หากทำการ run server สำเร็จ ให้แสดงข้อความนี้ใน cmd หรือ terminal
    console.log(`Server is running on port : ${PORT}`);
})
//ทำการ export app ที่เราสร้างขึ้น เพื่อให้สามารถนำไปใช้งานใน project อื่นๆ 
//เปรียบเสมือนเป็น module ตัวนึง
module.exports = app;
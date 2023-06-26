const fs = require('fs');
const filePath = 'log.txt';

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getDateString() {
    const s = (new Date()).toLocaleTimeString();
    return s;
}

function logResponse(text) {
    const log = `${getDateString()} ${text}`;
    console.info(log);
    fs.appendFile(filePath, log+"\r\n", (error) => {
        if (error) {
            console.log('An error occurred:', error);
        } else {
            console.log('Text appended to file successfully.');
        }
    });
}
async function getData() {

    let res;
    while (true) {
        try {
            res = await fetch("https://mimosaapp.misa.vn/api/g1/di/DiCacheConfigs", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "host":"mimosaapp.misa.vn",
                    "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5",
                    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxMWM2OTY2NS0yYTgyLTQwNzItOWZiZS0xYTIzNjlkNTkwYjQiLCJkaWQiOiIxNDc5NTFkNC0zZmE1LTRmM2EtYmI2Ny0xNzE0MDRkMzRjZWYiLCJzaWQiOiJiNDhjNDhlZjQxZTQ0MjEyOTY3ZTliYWYzMjUyNDU1ZiIsInRpZCI6IjI1MWZkYjNhLWY2OWItMTFlYy05M2FmLTAwNTA1NmIzMDI1OSIsInVuYSI6InBvX21pbW9zYUBnbWFpbC5jb20iLCJmbmEiOiJOZ3V54buFbiBC4bqjbyBOZ-G7jWMiLCJuYmYiOjE2ODc3NDMxNzgsImV4cCI6MTY4NzgyOTU3OCwiaWF0IjoxNjg3NzQzMTc4LCJpc3MiOiJNSVNBSlNDIn0.LLAXNYNdeQmg4DMHe27fg0MgHuVRIsE8ddOpI0K2RyI",
                    "mimosasessionid": "9d93ad70-3a0e-4e64-9202-298cad21d95b",
                    "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "cookie": "_ga_H8EB1RJ15T=GS1.1.1656558944.1.1.1656558954.0; _ga_0B367ZES0P=GS1.1.1658917460.1.1.1658917470.0; _ga_2B9RDZ4E89=GS1.1.1658917460.1.1.1658917471.0; x-device-id=8e8df49a202c44c3a2ecab951c204ced; _ga=GA1.1.568296369.1655809352; _ga_2HDB2Z79W3=GS1.1.1677495247.1.1.1677497205.0.0.0; _ga_ML5WDM0KD9=GS1.1.1677495249.1.1.1677497205.0.0.0; _ga_CSP58XPC4T=GS1.1.1679970690.1.1.1679970741.0.0.0; twk_uuid_62de51be54f06e12d88b2a1e=%7B%22uuid%22%3A%221.1UiUt1PpiB4pm0bCenCpV03dqHLl4nAcHlrBZdEkW6gKkdkTZOOV7OrX0pf3flRYwrLvzH8IDehzNFmUmnS1VsbaFpgV8qwi4hh5Vf4kmPPNEdy%22%2C%22version%22%3A3%2C%22domain%22%3A%22misa.vn%22%2C%22ts%22%3A1680512793296%7D; _ga_PLJ2F0QDT8=GS1.1.1680513087.3.0.1680513087.0.0.0; x-session=82fc6634b0354344a14b4e663cfe6bf7; x-dbid=147951d4-3fa5-4f3a-bb67-171404d34cef; _ga_16H7SQYWHC=GS1.1.1687485592.430.1.1687485597.0.0.0; TS01d3907e=019ba1692d391182c2f3ebebe880e583aa8a1780badfa77a4432a24a4864a07ac72e77b583ad8e41a03e951cc4a989b5d5d45f2ead3c23a9e31e76bd32bdae8dfd8f012a4ba677e5dc7a0c0762546e0468fb9a4902; _ga_JSH567S7RT=GS1.1.1687483240.31.1.1687486111.0.0.0",
                    "Referer": "https://mimosaapp.misa.vn/initialinformationdeclaration",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            });
            if (res.ok) {
                const data = await res.json();
                logResponse('Request success');
            } else {
                throw res;
            }


        } catch (errorResponse) {
            logResponse(`Request fail ${errorResponse} - ${errorResponse.cause}`);
        }
        await sleep(10000);
    }

}

getData().then(res => {
    var len = res.length;
})

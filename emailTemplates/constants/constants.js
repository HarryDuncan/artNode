const Icon = require('./Icons.js')

const emailHeader = `<head>
						<style>
						body {
							background: linear-gradient(90deg, rgba(255,255,255,1) 9%, rgba(139,139,139,1) 50%, rgba(255,255,255,1) 91%);font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
							margin: 0;}


						.main-section{ width: 60%; height:100vh !important; background-color: white; margin: 0 auto; margin-top: -3%; }
						#header-img{
								    height: 3em;
								    margin-top: 4%;
								    margin-bottom: 2%;
								   
							}
						h1   {color: black; font-size: 1.2em; font-weight:600; letter-spacing: 0.15em}

						span {color: black; font-weight:400; letter-spacing: 0.15em}
						p    {color: black; letter-spacing: 0.15em}
						.section{
							border-bottom: 2px solid black;
							margin: 5%;
						}
						#shipping-details{
							margin : 0 auto;
							justify-self: center;
							color: gray;
						}
						#receipt{
							max-height: 50vh;
							overflow-y: scroll;
						}
						.product-item{
							display: flex;
						    width: 80%;
						    justify-content: center;
						    margin: 0 auto;
						    margin-bottom: 5%;
						}
						.product-details{
							display: flex;
						    flex-direction: column;
						    float: left;
						    padding-right: 20%;
							}
						.product-img{
							max-height: 7em;
							float: right;
						}
						.purchase-details{
							display: flex;
							float: left;
							flex-direction: column;
							margin: 5%;
						}
						.purchase-details span{
							color: gray;
							letter-spacing: 0.15em;
							font-weight: 300;
							font-size: small;
						}
						.footer{
							background-color: black;
							position: fixed;
							bottom: 0;
							left: 20%;
							height: 5em;
							color: white;
							width: 60%;
							display: flex;
							flex-direction: column;
							
						}
						a{	color: white; letter-spacing: 0.15em; font-size : 1em; margin: 0 auto; justify-content: center;}
						#footer-links-container{
							margin : 0 auto;
							margin-top: 0.5em;

						}
						#footer-links-container svg{
							height: 0.8em;
							width: auto;
						}
	

					</style>
						</head>
					`
const receiptStart = `<div class='main-section'>
						<div class="section">
							<img id='header-img'  alt={'Harry.J Dee'} src="data:image/png;base64,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"/>
							<p>Thank you for supporting Harry.J Dee</p>
					</div>`

const orderStatusStart = `<div class='main-section'>
						<div class="section">
							<img id='header-img' src="data:image/png;base64,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"/>
							<p>Your order is on it's way</p>
						</div>`

const donationReceiptStart = `<div class='main-section'>
						<div class="section">
							<img id='header-img'  alt={'Harry.J Dee'} src="data:image/png;base64,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"/>
							<p>Thank you for your donation</p>
					</div>`


const footer = `<div class="footer">
				<a href=https://harryjdee.com>harryjdee.com</a>
				<a href=https://instagram.com/harryjdee>
					<div id='footer-links-container'>
						${Icon.Insta}
					</div>
				</a>
				</div></body>`

module.exports.emailHeader = emailHeader;
module.exports.receiptStart = receiptStart;
module.exports.orderStatusStart = orderStatusStart;
module.exports.donationReceiptStart = donationReceiptStart;
module.exports.footer = footer;
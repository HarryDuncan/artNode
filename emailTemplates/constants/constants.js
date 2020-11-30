const Icon = require('./Icons.js')

const emailHeader = `<head>
						<style>
						body {
							background: linear-gradient(90deg, rgba(255,255,255,1) 9%, rgba(139,139,139,1) 50%, rgba(255,255,255,1) 91%);font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
							margin: 0;}


						.main-section{ width: 60%; height:100vh !important; overflow: auto; background-color: white; margin: 0 auto; margin-bottom : 8em ;margin-top: -3%; }
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
						#thank-you{
							height : 5em;
							margin: 0 auto;
							clear: both;
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
							flex-direction: column;
							margin: 5%;
						}
						.purchase-details span{
							color: gray;
							letter-spacing: 0.15em;
							font-weight: 500;
							font-size: small;
						}
						.footer{
							background-color: black;
							position: fixed;
							bottom: 0;
							margin: 0 auto;
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
const receiptStart = `<div style="background-color:white;width60% overflow: auto; margin-bottom :8em"; class='main-section'>
						<div class="section">
							<img id='header-img'  alt='Harry.J Dee' src='https://harryjdee.com/images/icons/harryDLogo.png' />
							<img id='thank-you' alt='thanks' src='https://harryjdee.com/images/icons/ThankYou.png' /> 
							<p>Thank you for supporting Harry.J Dee</p>
					</div>`

const orderStatusStart = `<div class='main-section'>
						<div class="section">
							<img id='header-img' alt='Harry.J Dee' src='https://harryjdee.com/images/icons/harryDLogo.png' />
							<p>Your order is on it's way</p>
						</div>`

const donationReceiptStart = `<div class='main-section background-color:white;width60% overflow: auto;'>
						<div class="section">
							<img id='header-img' alt='Harry.J Dee' src='https://harryjdee.com/images/icons/harryDLogo.png' />
							<img id='thank-you' alt='thanks' src='https://harryjdee.com/images/icons/ThankYou.png' /> 
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
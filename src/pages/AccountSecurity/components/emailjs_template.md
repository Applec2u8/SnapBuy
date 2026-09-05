<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; }
  .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
  .logo { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 30px; text-align: center; }
  .logo span { color: #8b5cf6; }
  .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 15px; text-align: center; }
  .text { font-size: 14px; color: #475569; line-height: 1.6; text-align: center; margin-bottom: 30px; }
  .otp-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 30px; }
  .otp-code { font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #8b5cf6; margin: 0; }
  .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
  <div class="container">
    <div class="logo">Snap<span>Buy</span></div>
    
    <div class="title">Verify Your Identity</div>
    
    <div class="text">
      Hi {{to_name}},<br><br>
      We received a request to change your password. Use the verification code below to securely complete this process.
    </div>
    
    <div class="otp-box">
      <p class="otp-code">{{otp_code}}</p>
    </div>
    
    <div class="text" style="font-size: 13px;">
      This code expires in <strong>{{expiry_time}}</strong>.<br>
      If you did not request a password change, please ignore this email or contact support to secure your account.
    </div>
    
    <div class="footer">
      Sent at {{sent_time}}<br>
      © SnapBuy Inc. All rights reserved.
    </div>
  </div>
</body>
</html>
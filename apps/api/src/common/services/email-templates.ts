export const createAuthFirst = (otp: string, clientURL: string, email: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0; color: #f97316; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FaB-O2O</h1>
            <p>Xác thực tài khoản</p>
          </div>
          <div class="content">
            <h2>Xin chào!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản đối tác FaB-O2O.</p>
            <p>Mã xác thực OTP của bạn là:</p>
            <div class="otp-code">${otp}</div>
            <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
            <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
          </div>
          <div class="footer">
            <p>© 2024 FaB-O2O. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const createWelcomeEmail = (fullName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
          .feature { display: flex; align-items: center; gap: 15px; padding: 10px 0; }
          .feature-icon { width: 40px; height: 40px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FaB-O2O</h1>
            <p>Chào mừng bạn đến với FaB-O2O! 🎉</p>
          </div>
          <div class="content">
            <h2>Xin chào ${fullName}!</h2>
            <p>Cảm ơn bạn đã trở thành đối tác của FaB-O2O. Chúng tôi rất vui mừng được đồng hành cùng bạn!</p>
            <h3>Bạn có thể:</h3>
            <div class="feature">
              <div class="feature-icon">📦</div>
              <div>
                <strong>Quản lý đơn hàng</strong>
                <p style="margin: 0; color: #6b7280;">Theo dõi và xử lý đơn hàng dễ dàng</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">📊</div>
              <div>
                <strong>Xem báo cáo</strong>
                <p style="margin: 0; color: #6b7280;">Thống kê doanh thu và hiệu suất</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">🏪</div>
              <div>
                <strong>Quản lý cửa hàng</strong>
                <p style="margin: 0; color: #6b7280;">Cập nhật thông tin và menu</p>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 FaB-O2O. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

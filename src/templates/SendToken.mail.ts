export function generateKanbanEmailTemplate(name: string, token: string) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
        <div style="max-width: 600px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin: auto;">
          <h2 style="color: #333;">Hello, ${name}!</h2>
          <h3 style="color: #333;">Kanban Board Access Token</h3>
          <p style="color: #555;">Use the following 6-digit token to proceed:</p>
          <div style="font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;">${token}</div>
          <p style="color: #777;">If you didn't request this, please ignore this email.</p>
          <div style="margin-top: 20px; font-size: 12px; color: #777;">&copy; 2025 Kanban Board. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;
}

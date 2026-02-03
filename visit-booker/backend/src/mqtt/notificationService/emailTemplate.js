export function buildEmailTemplate({ subject, message, user }) {
  return `<!doctype html>
<html lang="pl">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${subject}</title>
		<style>
			body { margin: 0; padding: 0; background: #f6f7fb; font-family: Arial, sans-serif; color: #0f172a; }
			.wrapper { width: 100%; padding: 24px 0; }
			.card { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
			.header { background: #0ea5a4; color: #ffffff; padding: 20px 28px; }
			.brand { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
			.content { padding: 24px 28px; }
			.title { font-size: 18px; font-weight: 700; margin: 0 0 12px; }
			.text { font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
			.info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 14px; }
			.footer { padding: 18px 28px; font-size: 12px; color: #64748b; }
			.pill { display: inline-block; padding: 4px 10px; background: #e0f2f1; color: #0f766e; border-radius: 999px; font-size: 12px; font-weight: 600; }
		</style>
	</head>
	<body>
		<div class="wrapper">
			<div class="card">
				<div class="header">
					<div class="brand">VisitBooker</div>
					<div style="font-size: 13px; opacity: 0.9;">Zespół obsługi klienta • tel. 123 123 123</div>
				</div>
				<div class="content">
					<div class="title">${subject}</div>
					<p class="text">${message}</p>
					<div class="info-box">
						<div class="pill">Twoja wizyta z VisitBooker</div>
						<p class="text" style="margin-top: 10px;">
							Godziny pracy: 08:00–16:00, pon.–pt.<br />
							Adres: ul. Przykładowa 12, 00-001 Warszawa<br />
							Kontakt: visitbookerhelpdesk@gmail.com
						</p>
					</div>
				</div>
				<div class="footer">
					To jest wiadomość automatyczna. Jeśli nie rozpoznajesz tej aktywności, skontaktuj się z nami.
				</div>
			</div>
		</div>
	</body>
</html>`;
}

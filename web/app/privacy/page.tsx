import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface LegalResponse {
  success: boolean;
  message: string;
  data: {
    title: string;
    items: string[];
  };
}

async function getPrivacyPolicy(): Promise<LegalResponse | null> {
  try {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      console.warn("API_URL is not defined in .env");
      return null;
    }
    
    const res = await fetch(`${apiUrl}/users/privacy-policy`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Failed to fetch privacy policy: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function PrivacyPolicy() {
  const policy = await getPrivacyPolicy();
  const items = policy?.data?.items || [];
  const title = policy?.data?.title || "Privacy Policy";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>{title}</h1>
        </header>

        <section className={styles.content}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <span style={{ color: 'var(--color-white)', fontSize: '1.05rem', marginTop: '2px' }}>{index + 1}.</span>
                <p style={{ margin: 0, flex: 1 }}>{item}</p>
              </div>
            ))
          ) : (
            <p>Could not load the privacy policy at this time.</p>
          )}
        </section>
      </div>
    </div>
  );
}

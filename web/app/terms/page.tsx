import styles from "../privacy/page.module.css";

export const dynamic = "force-dynamic";

interface LegalResponse {
  success: boolean;
  message: string;
  data: {
    title: string;
    items: string[];
  };
}

async function getTerms(): Promise<LegalResponse | null> {
  try {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      console.warn("API_URL is not defined in .env");
      return null;
    }
    
    const res = await fetch(`${apiUrl}/users/terms-of-condition`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Failed to fetch terms: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function TermsAndConditions() {
  const terms = await getTerms();
  const items = terms?.data?.items || [];
  const title = terms?.data?.title || "Terms & Conditions";

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
            <p>Could not load the terms and conditions at this time.</p>
          )}
        </section>
      </div>
    </div>
  );
}

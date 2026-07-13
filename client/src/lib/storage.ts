const STORAGE_KEY = "form_submissions";

export function getFormSubmissions<T>(): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFormSubmission<T>(submission: T): void {
  const submissions = getFormSubmissions<T>();
  submissions.push(submission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export function clearFormSubmissions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

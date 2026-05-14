import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import TinderCard from 'react-tinder-card';
import toast, { Toaster } from 'react-hot-toast';

// Dostępne technologie – dopasowane do rzeczywistych tagów z API Remotive
const DOSTEPNE_TECHNOLOGIE = [
  'AWS',
  'docker',
  'git',
  'api',
  'CSS',
  'backend',
  'fullstack',
  'go',
  'android',
  'ios',
  'cloud',
  'AI/ML',
];

function App() {
  // ----------------------------------------------------------
  // Stany
  // ----------------------------------------------------------
  const [jobs, setJobs] = useState([]);           // Oferty do wyświetlenia
  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Stan ekranu konfiguracji profilu
  const [isProfileSet, setIsProfileSet] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [noResults, setNoResults] = useState(false); // Komunikat o braku ofert

  // ----------------------------------------------------------
  // Memoizowane wartości
  // ----------------------------------------------------------
  const remainingJobs = useMemo(() => jobs.slice().reverse(), [jobs]);

  const childRefs = useMemo(
    () => remainingJobs.map(() => React.createRef()),
    [remainingJobs]
  );

  // ----------------------------------------------------------
  // Synchronizacja savedJobs z localStorage
  // ----------------------------------------------------------
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  // ----------------------------------------------------------
  // Obsługa kliknięcia checkboxa
  // ----------------------------------------------------------
  const handleCheckboxChange = (tech) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  // ----------------------------------------------------------
  // Pobranie ofert po kliknięciu "Rozpocznij szukanie"
  // ----------------------------------------------------------
  const handleStartSearch = async () => {
    if (selectedTechs.length === 0) return;

    setIsLoading(true);
    setNoResults(false);

    try {
      const techQuery = selectedTechs.join(',');
      const res = await axios.get(
        `http://localhost:3000/api/oferty?tech=${encodeURIComponent(techQuery)}`
      );

      if (res.data.length === 0) {
        // Pusta tablica – brak ofert dla wybranych technologii
        setNoResults(true);
        setJobs([]);
      } else {
        setJobs(res.data);
        setIsProfileSet(true);
      }
    } catch (err) {
      console.error('Błąd pobierania ofert:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Handler swipe – wywoływany po puszczeniu karty
  // ----------------------------------------------------------
  const onSwipe = (direction, job) => {
    if (direction === 'right') {
      setSavedJobs((prev) => [...prev, job]);

      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800">Oferta zapisana!</span>
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
              onClick={() => toast.dismiss(t.id)}
            >
              Aplikuj teraz
            </a>
          </div>
        ),
        { duration: 5000 }
      );
    }
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
  };

  // ----------------------------------------------------------
  // Usuwanie pojedynczej zapisanej oferty
  // ----------------------------------------------------------
  const handleDeleteOne = (jobId) => {
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  // ----------------------------------------------------------
  // Usuwanie wszystkich zapisanych ofert
  // ----------------------------------------------------------
  const handleDeleteAll = () => {
    setSavedJobs([]);
  };

  // ----------------------------------------------------------
  // Pomocnik formatujący widełki płacowe
  // ----------------------------------------------------------
  const formatSalary = (min, max) => {
    const formatter = new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  };

  // ----------------------------------------------------------
  // Render – ekran konfiguracji profilu
  // ----------------------------------------------------------
  if (!isProfileSet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', padding: '12px 16px' } }} />

        <div className="w-full max-w-md rounded-2xl bg-slate-800/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
          {/* Nagłówek */}
          <h1 className="mb-2 text-center text-3xl font-extrabold text-white">
            🔥 IT Tinder
          </h1>
          <p className="mb-8 text-center text-sm text-slate-400">
            Konfiguracja profilu
          </p>

          {/* Lista checkboxów z technologiami */}
          <div className="mb-6 space-y-3">
            <p className="text-sm font-semibold text-slate-300">
              Wybierz technologie, które Cię interesują:
            </p>
            {DOSTEPNE_TECHNOLOGIE.map((tech) => (
              <label
                key={tech}
                className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/50 px-4 py-3 transition-colors hover:bg-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedTechs.includes(tech)}
                  onChange={() => handleCheckboxChange(tech)}
                  className="h-5 w-5 rounded border-slate-500 bg-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-slate-200">{tech}</span>
              </label>
            ))}
          </div>

          {/* Komunikat o braku wyników */}
          {noResults && (
            <p className="mb-4 rounded-lg bg-amber-500/20 px-4 py-3 text-center text-sm font-medium text-amber-300">
              Brak ofert dla wybranych technologii. Spróbuj innych.
            </p>
          )}

          {/* Przycisk "Rozpocznij szukanie" */}
          <button
            onClick={handleStartSearch}
            disabled={selectedTechs.length === 0 || isLoading}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ładowanie...
              </span>
            ) : (
              'Rozpocznij szukanie'
            )}
          </button>

          {/* Podpowiedź, gdy nic nie wybrano */}
          {selectedTechs.length === 0 && (
            <p className="mt-3 text-center text-xs text-slate-500">
              Zaznacz przynajmniej jedną technologię
            </p>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Render – główny widok z kartami (po konfiguracji)
  // ----------------------------------------------------------
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', padding: '12px 16px' } }} />

      {/* Nagłówek */}
      <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white">
        🔥 IT Tinder
      </h1>
      <p className="mb-10 text-sm text-slate-400">
        Przesuń w prawo, aby zapisać · Przesuń w lewo, aby pominąć
      </p>

      {/* Kontener stosu kart */}
      <div className="relative flex h-[420px] w-full max-w-sm items-center justify-center">
        {remainingJobs.length > 0 ? (
          remainingJobs.map((job, index) => (
            <TinderCard
              key={job.id}
              ref={childRefs[index]}
              onSwipe={(dir) => onSwipe(dir, job)}
              preventSwipe={['up', 'down']}
              swipeRequirementType="position"
              className="absolute"
            >
              {/* Pojedyncza karta */}
              <div className="flex h-[400px] w-[340px] cursor-grab select-none flex-col justify-between rounded-2xl bg-white p-6 shadow-xl shadow-black/30 active:cursor-grabbing">
                <div>
                  {/* Tytuł stanowiska */}
                  <h2 className="mb-1 text-xl font-bold text-slate-800">{job.title}</h2>

                  {/* Nazwa firmy */}
                  <p className="mb-4 text-sm font-medium text-blue-600">{job.company}</p>

                  {/* Widełki płacowe */}
                  <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </p>

                  {/* Tagi technologii */}
                  <div className="flex flex-wrap gap-2">
                    {job.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stopka karty */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span>Swipe ➡️ aby zapisać</span>
                  <span>⬅️ aby pominąć</span>
                </div>
              </div>
            </TinderCard>
          ))
        ) : (
          /* Pusty stan – wszystkie karty przesunięte */
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">🎉</span>
            <p className="text-xl font-semibold text-white">To już wszystkie oferty na dziś!</p>
            <p className="text-sm text-slate-400">
              Masz {savedJobs.length} zapisanych ofert w przeglądarce.
            </p>
          </div>
        )}
      </div>

      {/* Przycisk zapisanych ofert */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-6 rounded-full border border-slate-500 px-5 py-2 text-sm font-medium text-slate-300 transition-all hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      >
        📋 Zapisane oferty ({savedJobs.length})
      </button>

      {/* Modal z zapisanymi ofertami */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-slate-800 p-6 shadow-2xl shadow-black/50">
            {/* Nagłówek modala */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Twoje ulubione oferty</h2>
              <div className="flex items-center gap-2">
                {/* Przycisk usuwania wszystkich */}
                {savedJobs.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-600/40 hover:text-red-300"
                  >
                    Usuń wszystkie
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Lista zapisanych ofert */}
            {savedJobs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {savedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-xl bg-slate-700/50 p-4 transition-colors hover:bg-slate-700"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                      <p className="text-xs text-slate-400">{job.company}</p>
                      <p className="mt-1 text-xs font-medium text-green-400">
                        {formatSalary(job.salary_min, job.salary_max)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-600"
                      >
                        Aplikuj
                      </a>
                      {/* Przycisk usuwania pojedynczej oferty */}
                      <button
                        onClick={() => handleDeleteOne(job.id)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-600/30 hover:text-red-400"
                        title="Usuń ofertę"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="text-4xl">💔</span>
                <p className="text-sm text-slate-400">
                  Nie masz jeszcze żadnych zapisanych ofert. Przesuwaj karty w prawo!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import TinderCard from 'react-tinder-card';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Indeks aktualnie wyświetlanej (wierzchniej) karty
  const remainingJobs = useMemo(
    () => jobs.slice().reverse(),
    [jobs]
  );

  // Referencje do kart – po jednej na każdą pozostałą ofertę
  const childRefs = useMemo(
    () => remainingJobs.map(() => React.createRef()),
    [remainingJobs]
  );

  // ----------------------------------------------------------
  // Pobranie danych z API
  // ----------------------------------------------------------
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/oferty');
        setJobs(res.data);
      } catch (err) {
        console.error('Błąd pobierania ofert:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // ----------------------------------------------------------
  // Synchronizacja savedJobs z localStorage
  // ----------------------------------------------------------
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  // ----------------------------------------------------------
  // Handler swipe – wywoływany po puszczeniu karty
  // ----------------------------------------------------------
  const onSwipe = (direction, job) => {
    if (direction === 'right') {
      // Dodajemy ofertę do zapisanych (stan + localStorage)
      setSavedJobs((prev) => [...prev, job]);

      // Toast z klikalnym przyciskiem "Aplikuj teraz"
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
    // Po przesunięciu usuwamy ofertę ze stosu
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
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
  // Render
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
        {isLoading ? (
          <p className="text-lg font-medium text-slate-300 animate-pulse">Ładowanie ofert...</p>
        ) : remainingJobs.length > 0 ? (
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
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              >
                ✕
              </button>
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
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-600"
                    >
                      Aplikuj
                    </a>
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

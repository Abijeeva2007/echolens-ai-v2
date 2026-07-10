type Analysis = {
  summary: string;
  main_claim: string;
  persuasion: string[];
  biases: string[];
  missing_perspectives: string[];
  logical_fallacies: string[];
  emotion: string;
  credibility_score: number;
  confidence: number;
  questions: string[];
  recommendation: string;
};

export default function AnalysisReport({
  result,
}: {
  result: Analysis;
}) {
  return (
    <div className="space-y-6 mt-8">

      <div className="rounded-2xl border shadow-md p-6 bg-white">
        <h2 className="text-2xl font-bold mb-3">
          📰 Summary
        </h2>

        <p>{result.summary}</p>
      </div>

      <div className="rounded-2xl border shadow-md p-6 bg-white">
        <h2 className="text-2xl font-bold mb-3">
          🎯 Main Claim
        </h2>

        <p>{result.main_claim}</p>
      </div>

      <div className="rounded-2xl border shadow-md p-6 bg-white">
        <h2 className="text-2xl font-bold mb-3">
          🧠 Persuasion Techniques
        </h2>

        <div className="flex flex-wrap gap-2">
          {result.persuasion.map((item) => (
            <span
              key={item}
              className="px-3 py-1 rounded-full bg-blue-100"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border shadow-md p-6 bg-white">
        <h2 className="text-2xl font-bold mb-3">
          ⚠️ Logical Fallacies
        </h2>

        <div className="flex flex-wrap gap-2">
          {result.logical_fallacies.map((item) => (
            <span
              key={item}
              className="px-3 py-1 rounded-full bg-red-100"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border shadow-md p-6 bg-white">
        <h2 className="text-2xl font-bold mb-3">
          🌍 Missing Perspectives
        </h2>

        <ul className="list-disc pl-5">
          {result.missing_perspectives.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border shadow-md p-6 bg-white">
        <h2 className="text-2xl font-bold mb-3">
          😊 Emotion
        </h2>

        <p className="text-xl">{result.emotion}</p>
      </div>

      <div className="rounded-2xl border shadow-md p-6 bg-white">

        <h2 className="text-2xl font-bold mb-4">
          📊 Credibility Score
        </h2>

        <div className="w-full h-5 rounded-full bg-gray-200 overflow-hidden">

          <div
            className="bg-green-500 h-5"
            style={{
              width: `${result.credibility_score}%`,
            }}
          />

        </div>

        <p className="mt-3 text-xl font-bold">
          {result.credibility_score}/100
        </p>

      </div>

      <div className="rounded-2xl border shadow-md p-6 bg-white">

        <h2 className="text-2xl font-bold mb-3">
          💡 Questions to Consider
        </h2>

        <ol className="list-decimal pl-5">

          {result.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}

        </ol>

      </div>

      <div className="rounded-2xl border shadow-md p-6 bg-green-50 border-green-400">

        <h2 className="text-2xl font-bold mb-3">
          ✅ Recommendation
        </h2>

        <p>{result.recommendation}</p>

      </div>

    </div>
  );
}
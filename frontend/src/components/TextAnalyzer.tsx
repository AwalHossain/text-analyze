import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Text, Hash, CircleDot, TextQuote, Search, BarChart2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { LoginDialog } from "./LoginDialog";
import { textAnalysisService } from "@/services/textAnalysis.service";

interface SpecificAnalysisResponse {
  statusCode: number;
  message: string;
  data: {
    type: string;
    count: number;
  }
}

interface FullAnalysisResponse {
  statusCode: number;
  message: string;
  data: {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    paragraphCount: number;
    longestWords: string[];
  }
}

interface AnalysisResults {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  longestWord: string;
}

export const TextAnalyzer = () => {
  const [text, setText] = useState("");
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [activeResult, setActiveResult] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loading, setLoading] = useState<string | null>(null); // Track loading state
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const validateText = () => {
    if (!text.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };


  const analyzeSpecific = async (type: string) => {
    if (!validateText()) return;
    try {
      if (!user) {
        setShowLoginDialog(true);
        return;
      }
      setLoading(type);
      const response = await textAnalysisService.analyzeSpecific({ 
        content: text, 
        type: type as 'words' | 'characters' | 'sentences' | 'paragraphs' | 'longestWord' 
      });
      const result = response.data;
      console.log(result,"result");
      
      setActiveResult(type);
      setResults(prev => ({
        ...prev,
        words: type === "words" ? result.count : (prev?.words || 0),
        characters: type === "characters" ? result.count : (prev?.characters || 0),
        sentences: type === "sentences" ? result.count : (prev?.sentences || 0),
        paragraphs: type === "paragraphs" ? result.count : (prev?.paragraphs || 0),
        longestWord: type === "longestWord" ? result.count.map((word) => word).join(", ") || "" : (prev?.longestWord || ""),
      }));
      // scrollToResults();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze text",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const analyzeAll = async () => {
    if (!validateText()) return;
    try {
      if (!user) {
        setShowLoginDialog(true);
        return;
      }

      setLoading('text');
      const response = await textAnalysisService.analyzeText({ content: text });
      const result = response as FullAnalysisResponse;
      console.log(result,"result");
      setActiveResult("text");
      setResults({
        words: result.data.wordCount,
        characters: result.data.characterCount,
        sentences: result.data.sentenceCount,
        paragraphs: result.data.paragraphCount,
        longestWord: result.data.longestWords.join(", "),
      });
      scrollToResults();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze text",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const analysisButtons = [
    { icon: Text, label: "Words", type: "words" },
    { icon: Hash, label: "Characters", type: "characters" },
    { icon: CircleDot, label: "Sentences", type: "sentences" },
    { icon: TextQuote, label: "Paragraphs", type: "paragraphs" },
    { icon: Search, label: "Longest Word", type: "longestWord" },
  ];

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 min-h-screen">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <motion.textarea
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here to analyze..."
        className={`w-full h-64 p-6 rounded-2xl border ${
          text.trim() ? 'border-slate-200' : 'border-red-200'
        } focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none transition-all duration-200 resize-none glass-morph`}
      />

        <div className="flex flex-wrap gap-3 justify-center items-center">
          {analysisButtons.map((button) => (
            <Button
              key={button.type}
              variant="outline"
              size="sm"
              onClick={() => analyzeSpecific(button.type)}
              className={`${
                activeResult === button.type
                  ? "bg-slate-800 text-white"
                  : ""
              }`}
              disabled={loading !== null}
            >
              {loading === button.type ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <button.icon className="w-4 h-4 mr-2" />
              )}
              {button.label}
            </Button>
          ))}

          <Button
            variant="default"
            onClick={analyzeAll}
            className="ml-4"
            disabled={loading !== null}
          >
            {loading === 'all' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <BarChart2 className="w-4 h-4 mr-2" />
            )}
            Analyze All
          </Button>
        </div>

        {results && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
              {(activeResult === "words" || activeResult === "text") && (
              <div className="result-card">
                <h3 className="text-lg font-semibold mb-2">Words</h3>
                <p className="text-3xl font-bold text-slate-700">{results.words || 0}</p>
              </div>
            )}
            
            {(activeResult === "characters" || activeResult === "text") && (
              <div className="result-card">
                <h3 className="text-lg font-semibold mb-2">Characters</h3>
                <p className="text-3xl font-bold text-slate-700">{results.characters || 0}</p>
              </div>
            )}

            {(activeResult === "sentences" || activeResult === "text") && (
              <div className="result-card">
                <h3 className="text-lg font-semibold mb-2">Sentences</h3>
                <p className="text-3xl font-bold text-slate-700">{results.sentences || 0}</p>
              </div>
            )}

            {(activeResult === "paragraphs" || activeResult === "text") && (
              <div className="result-card">
                <h3 className="text-lg font-semibold mb-2">Paragraphs</h3>
                <p className="text-3xl font-bold text-slate-700">{results.paragraphs || 0}</p>
              </div>
            )}

            {(activeResult === "longestWord" || activeResult === "text") && results.longestWord && (
              <div className="result-card">
                <h3 className="text-lg font-semibold mb-2">Longest Word</h3>
                <p className="text-3xl font-bold text-slate-700">{results.longestWord || ""}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      <LoginDialog
        isOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={() => {
          // Retry the analysis after successful login
          if (activeResult === 'all') {
            analyzeAll();
          } else if (activeResult) {
            analyzeSpecific(activeResult);
          }
        }}
      />
    </div>
  );
};
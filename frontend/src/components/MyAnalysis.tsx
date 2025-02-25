import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Text, Hash, CircleDot, TextQuote, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { textAnalysisService } from '@/services/textAnalysis.service';
import { useToast } from '@/components/ui/use-toast';

interface TextStats {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  longestWords: string[];
}

interface AnalysisData {
  _id: string;
  content: string;
  stats: TextStats;
  createdAt: string;
  updatedAt: string;
}

const MyAnalysis = () => {
  const { toast } = useToast();

  const { data: analyses, isLoading, error } = useQuery({
    queryKey: ['analyses'],
    queryFn: async () => {
      const response = await textAnalysisService.getAllAnalyses();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch analyses",
      variant: "destructive",
    });
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">My Analyses</h1>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Text className="w-4 h-4" />
            <span>{analyses?.length || 0} total analyses</span>
          </div>
        </div>

        {/* <ScrollArea className="h-[calc(100vh-200px)] pr-4"> */}
          <div className="grid gap-6">
            {analyses?.map((analysis: AnalysisData) => (
              <motion.div
                key={analysis._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group"
              >
                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="line-clamp-1 text-lg">
                        {analysis.content}
                      </div>
                      <span className="text-sm text-slate-500">
                        {format(new Date(analysis.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Analysis Statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatsCard
                        icon={Text}
                        label="Words"
                        value={analysis.stats.wordCount}
                      />
                      <StatsCard
                        icon={Hash}
                        label="Characters"
                        value={analysis.stats.characterCount}
                      />
                      <StatsCard
                        icon={CircleDot}
                        label="Sentences"
                        value={analysis.stats.sentenceCount}
                      />
                      <StatsCard
                        icon={TextQuote}
                        label="Paragraphs"
                        value={analysis.stats.paragraphCount}
                      />
                    </div>
                    {analysis.stats.longestWords.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <Search className="w-4 h-4" />
                          <span>Longest Words</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.stats.longestWords.map((word, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-100 rounded-md text-sm text-slate-700"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        {/* </ScrollArea> */}
      </motion.div>
    </div>
  );
};

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
}

const StatsCard = ({ icon: Icon, label, value }: StatsCardProps) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
    <Icon className="w-4 h-4 text-slate-600" />
    <div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
    </div>
  </div>
);

export default MyAnalysis;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  MapPin,
  Route,
  User,
  Compass,
  ArrowRight
} from 'lucide-react';
import { campusService } from '../services/campusService';
import { useNavigation } from '../context/NavigationContext';

export default function AssistantPage() {
  const { userLocation, navigateToLocation, setSelectedLocation, setMapCenter } = useNavigation();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Hello! I am your **CampusNav Assistant**. Ask me where buildings are located, how to reach departments, or to find the nearest canteens, libraries, or emergency posts.",
      suggestedQueries: [
        "Where is the Central Library?",
        "How do I reach CSE department from Main Gate?",
        "Where is the nearest canteen?",
        "Which building has Seminar Hall?",
        "Where is the medical center?"
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (queryText) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const resp = await campusService.queryAssistant(textToSend, userLocation);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: resp.answer,
        action: resp.action,
        targetName: resp.target_name,
        coordinates: resp.coordinates,
        suggestedQueries: resp.suggested_queries
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: "I encountered a problem processing that inquiry. Please try asking again or search directly on the Campus Map."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAction = (action) => {
    if (!action) return;
    if (action.type === 'navigate') {
      navigateToLocation({
        id: action.target_id,
        name: action.target_name || 'Destination',
        latitude: action.coordinates ? action.coordinates[0] : 13.0105,
        longitude: action.coordinates ? action.coordinates[1] : 80.2355
      });
      navigate('/map');
    } else if (action.type === 'view_building') {
      navigate(`/buildings/${action.target_id}`);
    } else if (action.type === 'view_facility' && action.coordinates) {
      setMapCenter(action.coordinates);
      navigate('/map');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-['Outfit']">CampusNav AI Assistant</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Interactive Agent
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Natural language guidance across buildings, walkways, facilities, and departments
          </p>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-teal-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`space-y-3 max-w-[85%] sm:max-w-[75%]`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
                }`}
              >
                {/* Parse basic markdown bold */}
                <div dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                }} />
              </div>

              {/* Bot Action Cards */}
              {msg.action && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerAction(msg.action)}
                    className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-950 transition-colors"
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>
                      {msg.action.type === 'navigate' ? 'Show Route on Map' : 'Open Building Blueprint'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Suggested Questions */}
              {msg.suggestedQueries && msg.suggestedQueries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggestedQueries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-[11px] px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-teal-300 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 border border-slate-700">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" />
              <span>Analyzing campus graph and database...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything (e.g. 'Where is the library?' or 'Navigate to CSE department')..."
            className="flex-1 py-3 pl-4 pr-12 rounded-xl bg-slate-900 border border-slate-700 focus:border-teal-500 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="absolute right-2 top-2 p-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

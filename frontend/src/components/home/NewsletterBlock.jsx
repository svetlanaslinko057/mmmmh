/**
 * BLOCK V2-20: Newsletter Block
 * Email subscription block
 */
import React, { useState } from "react";
import { Mail, Gift, CheckCircle } from "lucide-react";

export default function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would send to API
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div 
      data-testid="newsletter-block"
      className="my-12 sm:my-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl2 shadow-medium p-8 sm:p-12 text-white"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
          <Gift className="w-4 h-4" />
          <span className="text-sm font-semibold">-10% на першу покупку</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          Підписуйтесь на розсилку
        </h2>
        <p className="opacity-90 mb-6">
          Отримуйте найкращі пропозиції, новинки та ексклюзивні знижки першими
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 text-lg">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <span>Дякуємо за підписку!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white/50 outline-none"
                required
              />
            </div>
            <button 
              type="submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all hover:-translate-y-0.5"
            >
              Підписатися
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

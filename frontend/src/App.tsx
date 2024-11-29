import React, { useState, useMemo } from 'react';
import { PieChart } from './components/PieChart';
import { SalesHeader } from './components/SalesHeader';
import { PizzaSelector } from './components/PizzaSelector';
import { DateSelector } from './components/DateSelector';
import { pizzaSalesData } from './data/pizzaSales';
import { format, parse } from 'date-fns';
import NivoServerSide from './components/NivoServerSide';

function App() {
  const [selectedPizzas, setSelectedPizzas] = useState<Set<string>>(
    new Set(pizzaSalesData.map(pizza => pizza.label))
  );

  const [pizzaColors, setPizzaColors] = useState<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    pizzaSalesData.forEach(pizza => {
      if (!colors[pizza.label]) {
        colors[pizza.label] = pizza.color;
      }
    });
    return colors;
  });

  const dates = pizzaSalesData.map(pizza => 
    parse(pizza.date, 'yyyy-MM-dd', new Date())
  );
  const minDate = useMemo(() => new Date(Math.min(...dates.map(d => d.getTime()))), []);
  const maxDate = useMemo(() => new Date(Math.max(...dates.map(d => d.getTime()))), []);
  
  const [selectedDate, setSelectedDate] = useState<Date>(minDate);

  const handleTogglePizza = (label: string) => {
    setSelectedPizzas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const handleColorChange = (label: string, color: string) => {
    setPizzaColors(prev => ({
      ...prev,
      [label]: color
    }));
  };

  const filteredData = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return pizzaSalesData
      .filter(pizza => pizza.date === dateStr && selectedPizzas.has(pizza.label))
      .map(pizza => ({
        ...pizza,
        id: pizza.label,
        color: pizzaColors[pizza.label]
      }));
  }, [selectedDate, selectedPizzas, pizzaColors]);

  const uniquePizzas = useMemo(() => 
    Array.from(new Set(pizzaSalesData.map(pizza => ({
      id: pizza.label,
      label: pizza.label,
      color: pizzaColors[pizza.label]
    })))),
    [pizzaColors]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <SalesHeader />
        <h1 className="text-3xl font-bold mb-4">Client Side Chart</h1>
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          minDate={minDate}
          maxDate={maxDate}
        />
        <PizzaSelector
          pizzas={uniquePizzas}
          selectedPizzas={selectedPizzas}
          onTogglePizza={handleTogglePizza}
          onColorChange={handleColorChange}
        />
        <div className="bg-white rounded-lg shadow-lg p-6">
          {filteredData.length > 0 ? (
            <PieChart data={filteredData} />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              No pizza sales data available for the selected date and types
            </div>
          )}
        </div>
        <NivoServerSide />
      </div>
    </div>
  );
}

export default App;

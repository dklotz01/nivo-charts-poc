import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { pizzaSalesData } from '../data/pizzaSales';
import { DateSelector } from './DateSelector';
import { PizzaSelector } from './PizzaSelector';
import { format, parse } from 'date-fns';

interface ChartData {
  id: string;
  url: string;
}

const NivoServerSide = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

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

  useEffect(() => {
    axios.post('http://localhost:3001/chart', {
      data: filteredData,
    })
      .then((response) => {
        setChartData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [filteredData]);

  return (
    <div className="max-w-4xl mx-auto pt-6">
      <h1 className="text-3xl font-bold mb-4">Server Side Chart</h1>
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
        {chartData && <img src={`http://localhost:3001/render/${chartData.id}`} alt="Chart" />}
      </div>
    </div>
  );
};

export default NivoServerSide;

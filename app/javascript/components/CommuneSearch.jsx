import React, { useState, useEffect, useRef, useCallback } from "react";

export default function CommuneSearchCustom() {
  const [communes, setCommunes] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  // Récupération des suggestions depuis l'API
  const fetchSuggestions = useCallback(() => {
    if (inputValue.length < 3) {
      setCommunes([]);
      return;
    }
    fetch(`/autocomplete?q=${encodeURIComponent(inputValue)}`)
      .then((res) => res.json())
      .then(setCommunes)
      .catch((err) => {
        console.error("Erreur de récupération :", err);
        setCommunes([]);
      });
  }, [inputValue]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Sélection par défaut de la première suggestion quand la liste est mise à jour
  useEffect(() => {
    if (communes.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [communes]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Réinitialiser la sélection dès que l'utilisateur saisit du texte
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < communes.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : communes.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < communes.length) {
        const selected = communes[highlightedIndex];
        if (selected) goToCommune(selected.code);
      } else if (inputValue.trim() !== "") {
        goToCommune(inputValue);
      }
    }
  };

  const goToCommune = useCallback((code) => {
    window.location.href = `/communes/${code}`;
  }, []);

  const handleSuggestionClick = (index) => {
    const selected = communes[index];
    if (selected) goToCommune(selected.code);
  };

  // Gestion du blur pour masquer les suggestions après un léger délai
  const handleBlur = () => {
    setTimeout(() => {
      setCommunes([]);
    }, 100);
  };

  const handleFocus = () => {
    if (inputValue.length >= 3) {
      fetchSuggestions();
    }
  };

  // Fonction qui met en forme la suggestion :
  // La partie correspondant à l'input est affichée en fontWeight normal,
  // tandis que le reste (avant et après) est en bold.
  const renderSuggestionText = (suggestion) => {
    if (!inputValue) return <strong>{suggestion}</strong>;

    // Normalisation pour ignorer la casse et les accents
    const normalize = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const normalizedInput = normalize(inputValue);
    const normalizedSuggestion = normalize(suggestion);
    const matchIndex = normalizedSuggestion.indexOf(normalizedInput);

    if (matchIndex === -1) {
      // Si la saisie n'est pas trouvée, on affiche toute la suggestion en bold
      return <strong>{suggestion}</strong>;
    }

    const beforeMatch = suggestion.substring(0, matchIndex);
    const matchText = suggestion.substring(
      matchIndex,
      matchIndex + inputValue.length
    );
    const afterMatch = suggestion.substring(matchIndex + inputValue.length);

    return (
      <>
        <strong>{beforeMatch}</strong>
        {matchText}
        <strong>{afterMatch}</strong>
      </>
    );
  };

  return (
    <div className="commune-search-container" style={{ position: "relative" }}>
      <label className="form-label" htmlFor="commune-input">
        Rechercher une commune
      </label>
      <input
        id="commune-input"
        ref={inputRef}
        type="text"
        className="form-control mb-2"
        placeholder="Tapez une commune..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoComplete="off"
      />
      {communes.length > 0 && (
        <ul
          className="list-group"
          style={{
            position: "absolute",
            width: "100%",
            zIndex: 1000,
          }}
        >
          {communes.map((item, index) => (
            <li
              key={item.code}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                highlightedIndex === index ? "active" : ""
              }`}
              style={{ cursor: "pointer" }}
              // La souris ne modifie pas la sélection
              onMouseDown={() => handleSuggestionClick(index)}
            >
              <span>
                {renderSuggestionText(item.nom)} ({item.code})
              </span>
              <span className="badge bg-secondary">
                {item.population.toLocaleString()} hab
              </span>
            </li>
          ))}
        </ul>
      )}
      <button
        className="btn btn-primary mt-3"
        onClick={(e) => {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < communes.length) {
            const selected = communes[highlightedIndex];
            if (selected) goToCommune(selected.code);
          } else if (inputValue.trim() !== "") {
            goToCommune(inputValue);
          }
        }}
      >
        Rechercher
      </button>
    </div>
  );
}

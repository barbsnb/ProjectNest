import React, { useState, useEffect, useContext } from 'react';
import { AllVisitsContext } from '../../contexts/AllVisitsContext';
import { AuthContext } from '../../contexts/AuthContext';
import './AllVisitsList.css'

const AllVisitsList = () => {
    const { AllVisits } = useContext(AllVisitsContext);
    const { currentUser } = useContext(AuthContext);
    const [filteredVisits, setFilteredVisits] = useState(AllVisits);
    const [filterCriteria, setFilterCriteria] = useState({
        // Tutaj możesz zdefiniować początkowe wartości kryteriów filtrowania
        // np. guestFirstName: '', guestLastName: '', startDate: '', endDate: ''
    });
    const [isFiltering, setIsFiltering] = useState(false); // Stan określający, czy aktualnie stosowane są filtry
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (isFiltering) {
            applyFilters(); // Zastosuj filtry tylko jeśli użytkownik wyraźnie zdecyduje się na ich użycie
        } else {
            setFilteredVisits(AllVisits); // Jeśli nie ma filtra, wyświetl całą listę wizyt
        }
    }, [AllVisits, filterCriteria, isFiltering]);

    const handleFilterButtonClick = () => {
        setShowFilters(!showFilters); // Zamień wartość stanu, aby pokazać lub ukryć opcje filtracji
    };
    

    const applyFilters = () => {
        // Tutaj zastosuj kryteria filtrowania do listy AllVisits i ustaw nową listę wizyt
        const filtered = AllVisits.filter(visit => {
            const { guestFirstName, guestLastName, startDate, endDate } = filterCriteria;

            // Jeśli kryterium nie jest zdefiniowane, zwróć true, aby zachować wizytę
            const firstNameMatch = !guestFirstName || visit.guest_first_name.toLowerCase().includes(guestFirstName.toLowerCase());
            const lastNameMatch = !guestLastName || visit.guest_last_name.toLowerCase().includes(guestLastName.toLowerCase());
            const startDateMatch = !startDate || new Date(visit.start_time) >= new Date(startDate);
            const endDateMatch = !endDate || new Date(visit.end_time) <= new Date(endDate);

            // Zwróć true tylko wtedy, gdy wszystkie kryteria filtrowania są spełnione
            return firstNameMatch && lastNameMatch && startDateMatch && endDateMatch;
        });
        setFilteredVisits(filtered);
    };

    const handleFilterChange = (event) => {
        // Tutaj zaktualizuj stan kryteriów filtrowania w odpowiedzi na zmiany w interfejsie użytkownika
        const { name, value } = event.target;
        setFilterCriteria(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFilterApply = () => {
        setIsFiltering(true); // Ustaw stan, że aktualnie stosowane są filtry
    };

    const handleFilterReset = () => {
        setFilterCriteria({
            guestFirstName: '',
            guestLastName: '',
            startDate: '',
            endDate: ''
        });
        setIsFiltering(false); // Zresetuj stan, że aktualnie stosowane są filtry
    };

    return (
        <div>
            <h3>Filtruj wyniki</h3>
            
            {/* Dodaj interfejs użytkownika do wprowadzania kryteriów filtrowania */}
            <form>
                <input type="text" name="guestFirstName" placeholder="Imię gościa" onChange={handleFilterChange} />
                <input type="text" name="guestLastName" placeholder="Nazwisko gościa" onChange={handleFilterChange} />
                {/* Dodaj inne pola formularza w zależności od potrzeb */}
                <button type="button" id='filter_btn' onClick={handleFilterApply}>Filtruj</button>
                <button type="button" id='filter_btn' onClick={handleFilterReset}>Resetuj</button>
            </form>

            <div>
            <h1>Lista wszystkich wizyt</h1>
            <table className="visits-table">
                <thead>
                    <tr>
                        <th>Imię</th>
                        <th>Nazwisko</th>
                        <th>Data rozpoczęcia</th>
                        <th>Data zakończenia</th>
                        {/* Dodaj więcej kolumn według potrzeb */}
                    </tr>
                </thead>
                <tbody>
                    {filteredVisits.map(visit => (
                        <tr key={visit.id}>
                            <td>{visit.guest_first_name}</td>
                            <td>{visit.guest_last_name}</td>
                            <td>{visit.start_time}</td>
                            <td>{visit.end_time}</td>
                            {/* Dodaj więcej komórek dla dodatkowych informacji */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default AllVisitsList;

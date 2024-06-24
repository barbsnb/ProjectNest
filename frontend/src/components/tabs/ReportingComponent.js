import React, { useState, useContext } from "react";
import Autosuggest from 'react-autosuggest';
import { AuthContext } from "../../contexts/AuthContext";
import client from "../../axiosClient";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "./ReportingComponent.css";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { saveAs } from 'file-saver';

// Helper functions for Autosuggest
const getSuggestionValue = suggestion => `${suggestion.first_name} ${suggestion.last_name}`;
const renderSuggestion = suggestion => (
    <div>
        <span>{suggestion.first_name} {suggestion.last_name}</span>
        <span>{suggestion.email}</span>
        <span>{suggestion.room_number}</span>
    </div>
);

const ReportingComponent = () => {
    const { currentUser } = useContext(AuthContext);
    const [reportType, setReportType] = useState('');
    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [value, setValue] = useState('');

    const handleReportTypeChange = (e) => {
        setReportType(e.target.value);
        setReportData(null);
        setError('');
    };

    const fetchReportData = async (download = false) => {
        let url = '';
        let filename = 'report.csv';

        if (reportType === 'guestList') {
            url = `/api/user/${userId}/guests/`;
            filename = 'Lista_gości_dla_hosta.csv';
        } else if (reportType === 'receptionStats') {
            const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
            const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
            url = `/api/reception/stats/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
            filename = `Statystyki_aktywności_recepcji_${formattedStartDate}_do_${formattedEndDate}.csv`;
        } else if (reportType === 'monthlyReport') {
            const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
            const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
            url = `/api/monthly/report/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
            filename = `Raport_wizyt_w_wybranym_okresie_${formattedStartDate}_do_${formattedEndDate}.csv`;
        }

        if (download) {
            if (reportType === 'guestList') {
                url = `/api/user/${userId}/guests/download/`;
            } else if (reportType === 'receptionStats') {
                const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
                const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
                url = `/api/reception/stats/download/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
            } else if (reportType === 'monthlyReport') {
                const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
                const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
                url = `/api/monthly/report/download/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
            }

            try {
                const response = await client.get(url, { responseType: 'blob' });
                const blob = new Blob([response.data], { type: 'text/csv' });
                saveAs(blob, filename);
            } catch (error) {
                console.error(error);
            }
        } else {
            try {
                const response = await client.get(url);
                setReportData(response.data);
                setError('');
            } catch (error) {
                setReportData(null);
                if (error.response) {
                    setError(error.response.data.error || 'There was an error fetching the report!');
                } else {
                    setError('There was an error fetching the report!');
                }
            }
        }
    };


    const onSuggestionsFetchRequested = ({ value }) => {
        const fetchSuggestions = async () => {
            try {
                const response = await client.get(`/api/user_search/?q=${value}`);
                setSuggestions(response.data);
            } catch (error) {
                console.error(error);
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const onChange = (event, { newValue }) => {
        setValue(newValue);
    };

    const onSuggestionSelected = (event, { suggestion }) => {
        setUserId(suggestion.id);  // Ustaw userId na wartość pola id
    };

    const inputProps = {
        placeholder: 'Wyszukaj hosta',
        value,
        onChange: onChange,
        className: 'autosuggest-input'
    };

    const renderTable = () => {
        if (!reportData) return null;

        if (reportType === 'guestList') {
            return (
                <table className="visits-table">
                    <thead>
                    <tr>
                        <th>Imię gościa</th>
                        <th>Nazwisko gościa</th>
                        <th>Data wizyty</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData.guests.map(guest => (
                        <tr key={guest.id}>
                            <td>{guest.guest_first_name}</td>
                            <td>{guest.guest_last_name}</td>
                            <td>{guest.start_date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            );
        }

        if (reportType === 'receptionStats') {
            return (
                <table className="visits-table">
                    <thead>
                    <tr>
                        <th>Rodzaj</th>
                        <th>Wartość</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(reportData).map(([key, value]) => (
                        <tr key={key}>
                            <td>{key}</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            );
        }

        if (reportType === 'monthlyReport') {
            return (
                <table className="visits-table">
                    <thead>
                    <tr>
                        <th>Data</th>
                        <th>Liczba wizyt</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.start_date}</td>
                            <td>{entry.total}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            );
        }
    };

    return (
        <div className="container mt-4">
            <h2>Wybierz rodzaj raportu</h2>
            <Form className="mb-4">
                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="reportType" className="form-group">
                            <Form.Label>Rodzaj raportu</Form.Label>
                            <Form.Control as="select" value={reportType} onChange={handleReportTypeChange} className="form-control">
                                <option value="">-- Wybierz --</option>
                                <option value="guestList">Lista gości dla hosta</option>
                                <option value="receptionStats">Statystyki aktywności recepcji</option>
                                <option value="monthlyReport">Raport wizyt w wybranym okresie</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                {reportType === 'guestList' && (
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="userId" className="form-group">
                                <Form.Label>Wyszukaj Hosta</Form.Label>
                                <Autosuggest
                                    suggestions={suggestions}
                                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                                    getSuggestionValue={getSuggestionValue}
                                    renderSuggestion={renderSuggestion}
                                    inputProps={inputProps}
                                    onSuggestionSelected={onSuggestionSelected}
                                    theme={{
                                        container: 'autosuggest-container',
                                        suggestionsContainer: 'autosuggest-suggestions-container',
                                        suggestion: 'autosuggest-suggestion',
                                        suggestionHighlighted: 'autosuggest-suggestion--highlighted'
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                {(reportType === 'receptionStats' || reportType === 'monthlyReport') && (
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="startDate" className="form-group">
                                <Form.Label>Data początkowa</Form.Label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={date => setStartDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="endDate" className="form-group">
                                <Form.Label>Data końcowa</Form.Label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={date => setEndDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                <Button id="filter_btn" onClick={() => fetchReportData(false)} className="btn btn-primary">Generuj raport</Button>
                {reportData && <Button id="download_btn" onClick={() => fetchReportData(true)} className="btn btn-secondary">Pobierz raport</Button>}
            </Form>

            {error && <div className="error">{error}</div>}

            {reportData && (
                <div>
                    <h3>Wyniki raportu</h3>
                    {renderTable()}
                </div>
            )}
        </div>
    );
};

export default ReportingComponent;

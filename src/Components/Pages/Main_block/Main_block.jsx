import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    TextField,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';

function Main_block() {
    // Функция для инициализации состояния из localStorage
    const initializeState = () => {
        const savedState = localStorage.getItem('matchState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            // Преобразование строкового значения matchStartTime обратно в число
            if (parsedState.matchStartTime) {
                parsedState.matchStartTime = Number(parsedState.matchStartTime);
            }
            return parsedState;
        }
        return null;
    };

    const initialState = initializeState();

    const [matchStarted, setMatchStarted] = useState(initialState ? initialState.matchStarted : false);
    const [timer, setTimer] = useState(initialState ? initialState.timer : 0);
    const [halves, setHalves] = useState(initialState ? initialState.halves : 2);
    const [halfDuration, setHalfDuration] = useState(initialState ? initialState.halfDuration : 45);
    const [teamAName, setTeamAName] = useState(initialState ? initialState.teamAName : 'Команда А');
    const [teamBName, setTeamBName] = useState(initialState ? initialState.teamBName : 'Команда Б');
    const [events, setEvents] = useState(initialState ? initialState.events : []);
    const [showModal, setShowModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({});
    const [extraTime, setExtraTime] = useState(initialState ? initialState.extraTime : 0);
    const [totalMatchTime, setTotalMatchTime] = useState(initialState ? initialState.totalMatchTime : 0);
    const [currentHalf, setCurrentHalf] = useState(initialState ? initialState.currentHalf : 1);
    const [showEventsModal, setShowEventsModal] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(initialState ? initialState.elapsedTime : 0);
    const [matchStartTime, setMatchStartTime] = useState(initialState ? initialState.matchStartTime : null);
    const [inExtraTime, setInExtraTime] = useState(initialState ? initialState.inExtraTime : false);
    const [halfEnded, setHalfEnded] = useState(initialState ? initialState.halfEnded : false);

    // Сохранение состояния в localStorage при его изменении
    useEffect(() => {
        localStorage.setItem('matchState', JSON.stringify({
            matchStarted,
            timer,
            elapsedTime,
            matchStartTime,
            halves,
            halfDuration,
            teamAName,
            teamBName,
            events,
            extraTime,
            totalMatchTime,
            currentHalf,
            inExtraTime,
            halfEnded,
        }));
    }, [matchStarted, timer, elapsedTime, matchStartTime, halves, halfDuration, teamAName, teamBName, events, extraTime, totalMatchTime, currentHalf, inExtraTime, halfEnded]);

    // Обновление таймера и логика управления матчем
    useEffect(() => {
        let interval = null;
        if (matchStarted && matchStartTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const currentTimer = elapsedTime + Math.floor((now - matchStartTime) / 1000);
                setTimer(currentTimer);

                if (currentTimer >= halfDuration * 60 && !inExtraTime) {
                    // Начинается дополнительное время
                    setInExtraTime(true);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [matchStarted, matchStartTime, elapsedTime, halfDuration, inExtraTime]);

    // Обработка изменения состояния матча
    useEffect(() => {
        if (matchStarted) {
            if (!matchStartTime) {
                setMatchStartTime(Date.now());
            }
        } else {
            if (matchStartTime) {
                const now = Date.now();
                const addedElapsedTime = Math.floor((now - matchStartTime) / 1000);
                setElapsedTime(prevElapsedTime => prevElapsedTime + addedElapsedTime);
                setMatchStartTime(null);
            }
        }
    }, [matchStarted]);

    const handleEvent = (type, team) => {
        const currentTime = timer;
        const mainTimeMinutes = Math.floor(Math.min(currentTime, halfDuration * 60) / 60);
        const mainTimeSeconds = Math.min(currentTime, halfDuration * 60) % 60;
        const extraTimeMinutes = inExtraTime ? Math.floor((currentTime - halfDuration * 60) / 60) : 0;
        const extraTimeSeconds = inExtraTime ? (currentTime - halfDuration * 60) % 60 : 0;

        setCurrentEvent({
            type,
            team,
            half: currentHalf,
            time: `${mainTimeMinutes}:${mainTimeSeconds.toString().padStart(2, '0')}`,
            extraTime: inExtraTime ? `${extraTimeMinutes}:${extraTimeSeconds.toString().padStart(2, '0')}` : null,
        });
        setShowModal(true);
    };

    const saveEvent = (e) => {
        e.preventDefault();
        setEvents([...events, currentEvent]);
        setShowModal(false);
    };

    const commonButtonStyle = {
        mt: 1,
        width: '100%',
        justifyContent: "left",
        borderRadius: "10px",
        border: '1px solid #D9D9D9',
        color: '#000',
        padding: '6px 16px',
    };

    const renderActionButton = (iconSrc, label, onClick) => (
        <Button
            variant="outlined"
            sx={commonButtonStyle}
            onClick={onClick}
        >
            <img src={iconSrc} alt={label} width="20px" style={{ marginRight: '10px' }} />
            {label}
        </Button>
    );

    const startMatch = () => {
        setTotalMatchTime(halves * halfDuration * 60);
        setMatchStarted(true);
        setHalfEnded(false);
        setCurrentHalf(1);
        setTimer(0);
        setElapsedTime(0);
        setExtraTime(0);
        setInExtraTime(false);
        setMatchStartTime(Date.now());
    };

    const startNextHalf = () => {
        setMatchStarted(true);
        setHalfEnded(false);
        setTimer(0);
        setElapsedTime(0);
        setExtraTime(0);
        setInExtraTime(false);
        setMatchStartTime(Date.now());
    };

    const finishHalf = () => {
        setMatchStarted(false);
        setInExtraTime(false);
        setHalfEnded(true);
        setElapsedTime(0);
        setTimer(0);

        if (currentHalf < halves) {
            setCurrentHalf(prevHalf => prevHalf + 1);
        } else {
            alert('Матч окончен');
            finishMatch();
        }
    };

    // Функция для завершения матча и сброса всех состояний
    const finishMatch = () => {
        // Очистка состояния матча
        localStorage.removeItem('matchState');
        // Сброс состояний
        setMatchStarted(false);
        setTimer(0);
        setElapsedTime(0);
        setMatchStartTime(null);
        setHalves(2);
        setHalfDuration(45);
        setTeamAName('Команда А');
        setTeamBName('Команда Б');
        setEvents([]);
        setExtraTime(0);
        setTotalMatchTime(0);
        setCurrentHalf(1);
        setInExtraTime(false);
        setHalfEnded(false);
        alert('Матч завершен');
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Сводка футбольного матча</Typography>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                {!matchStarted && timer === 0 && currentHalf === 1 && !halfEnded && (
                    <Box component="form" sx={{ mb: 4 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Количество таймов"
                                    type="number"
                                    value={halves}
                                    onChange={e => setHalves(Number(e.target.value))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Время тайма (минуты)"
                                    type="number"
                                    value={halfDuration}
                                    onChange={e => setHalfDuration(Number(e.target.value))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Название команды А"
                                    value={teamAName}
                                    onChange={e => setTeamAName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Название команды Б"
                                    value={teamBName}
                                    onChange={e => setTeamBName(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={startMatch}
                        >
                            Начать матч
                        </Button>
                    </Box>
                )}

                {(matchStarted || timer > 0 || halfEnded) && (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Время матча: {Math.floor(Math.min(timer, halfDuration * 60) / 60)}:{(Math.min(timer, halfDuration * 60) % 60).toString().padStart(2, '0')}
                            {inExtraTime && (
                                <span style={{ color: 'red' }}>
                                    {' + '}{Math.floor((timer - halfDuration * 60) / 60)}:{((timer - halfDuration * 60) % 60).toString().padStart(2, '0')}
                                </span>
                            )}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Текущий тайм: {currentHalf}
                        </Typography>

                        {/* Если тайм завершен и есть следующий тайм */}
                        {!matchStarted && halfEnded && currentHalf <= halves && (
                            <Box sx={{ mt: 4 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={startNextHalf}
                                >
                                    Начать новый тайм
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{ ml: 2 }}
                                    onClick={finishMatch}
                                >
                                    Завершить матч
                                </Button>
                            </Box>
                        )}

                        {matchStarted && (
                            <>
                                <Grid container spacing={4} alignItems="center">
                                    {/* Команда А */}
                                    <Grid item xs={5}>
                                        <Typography variant="h6" align="center">{teamAName}</Typography>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            {renderActionButton('/goal.png', 'Гол', () => handleEvent('Гол', teamAName))}
                                            {renderActionButton('/change.png', 'Замена', () => handleEvent('Замена', teamAName))}
                                            {renderActionButton('/YC.png', 'ЖК', () => handleEvent('Желтая карточка', teamAName))}
                                            {renderActionButton('/RC.png', 'КК', () => handleEvent('Красная карточка', teamAName))}
                                        </Box>
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Typography variant="h6" align="center">VS</Typography>
                                    </Grid>

                                    {/* Команда Б */}
                                    <Grid item xs={5}>
                                        <Typography variant="h6" align="center">{teamBName}</Typography>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            {renderActionButton('/goal.png', 'Гол', () => handleEvent('Гол', teamBName))}
                                            {renderActionButton('/change.png', 'Замена', () => handleEvent('Замена', teamBName))}
                                            {renderActionButton('/YC.png', 'ЖК', () => handleEvent('Желтая карточка', teamBName))}
                                            {renderActionButton('/RC.png', 'КК', () => handleEvent('Красная карточка', teamBName))}
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Кнопки управления таймом и матчем */}
                                <Box sx={{ mt: 4 }}>
                                    {inExtraTime && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mr: 2 }}
                                            onClick={finishHalf}
                                        >
                                            Завершить тайм
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={finishMatch}
                                    >
                                        Завершить матч
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                )}

                {/* Кнопка для отображения событий */}
                {events.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setShowEventsModal(true)}
                        >
                            Просмотреть события матча
                        </Button>
                    </Box>
                )}

                {/* Модальное окно для событий */}
                <Dialog open={showModal} onClose={() => setShowModal(false)}>
                    <DialogTitle>{`Добавить событие: ${currentEvent.type}`}</DialogTitle>
                    <DialogContent>
                        <Box component="form" id="event-form" onSubmit={saveEvent}>
                            {currentEvent.type !== 'Замена' && (
                                <TextField
                                    margin="dense"
                                    label="Игрок"
                                    fullWidth
                                    required
                                    onChange={e => setCurrentEvent({ ...currentEvent, player: e.target.value })}
                                />
                            )}
                            {currentEvent.type === 'Гол' && (
                                <TextField
                                    margin="dense"
                                    label="Ассистент"
                                    fullWidth
                                    onChange={e => setCurrentEvent({ ...currentEvent, assistant: e.target.value })}
                                />
                            )}
                            {currentEvent.type === 'Замена' && (
                                <>
                                    <TextField
                                        margin="dense"
                                        label="Игрок ушел"
                                        fullWidth
                                        required
                                        onChange={e => setCurrentEvent({ ...currentEvent, playerOut: e.target.value })}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Игрок вошел"
                                        fullWidth
                                        required
                                        onChange={e => setCurrentEvent({ ...currentEvent, playerIn: e.target.value })}
                                    />
                                </>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowModal(false)}>Отмена</Button>
                        <Button type="submit" form="event-form">Сохранить</Button>
                    </DialogActions>
                </Dialog>

                {/* Модальное окно для отображения событий и счета */}
                <Dialog open={showEventsModal} onClose={() => setShowEventsModal(false)}>
                    <DialogTitle>События матча</DialogTitle>
                    <DialogContent>
                        {/* Вычисление счета */}
                        {(() => {
                            let teamAScore = 0;
                            let teamBScore = 0;

                            events.forEach(event => {
                                if (event.type === 'Гол') {
                                    if (event.team === teamAName) {
                                        teamAScore += 1;
                                    } else if (event.team === teamBName) {
                                        teamBScore += 1;
                                    }
                                }
                            });

                            return (
                                <Typography variant="h5" align="center" gutterBottom>
                                    {teamAName} : {teamBName} <br />
                                    {teamAScore} : {teamBScore} 
                                </Typography>
                            );
                        })()}
                        <List>
                            {events.map((event, index) => (
                                <React.Fragment key={index}>
                                    <ListItem alignItems="flex-start" sx={{ paddingLeft: 0, paddingRight: 0 }}>
                                        <ListItemText
                                            primary={`${event.time}${event.extraTime ? ` + ${event.extraTime}` : ''} - Тайм ${event.half} - ${event.team}`}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="textPrimary">
                                                        {event.type}
                                                    </Typography>
                                                    {" — "}
                                                    {event.type === 'Замена' ? (
                                                        `Ушел: ${event.playerOut}, Вошел: ${event.playerIn}`
                                                    ) : (
                                                        `${event.player}`
                                                    )}
                                                    {event.assistant && ` (Ассистент: ${event.assistant})`}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < events.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowEventsModal(false)}>Закрыть</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default Main_block;

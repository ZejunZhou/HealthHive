import styles from './topbar.module.css';

function Topbar({ children }) {
    return (
        <div className={styles.topbar}>
            <div className={styles.childrenRight}>
                <button className={`btn btn-light`}>{children}</button>
            </div>
        </div>
    );
}

export default Topbar
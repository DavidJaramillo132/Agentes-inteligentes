def greeting(name: str) -> str:
    """
    Returns a greeting message for the given name.
    
    Args:
        name (str): The name to include in the greeting.
    
    Returns:
        str: A greeting message.
    """
    return f"Hello, {name}!"

# Example usage:
result = greeting("World")  # Outputs: Hello, World!
print(result)